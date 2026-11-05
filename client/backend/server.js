
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const Report = require("./models/Report");
const User = require("./models/User");
const Comment = require("./models/Comment");
const Notification = require("./models/Notification");
const ReportActivity = require("./models/ReportActivity");
const AuthorityRating = require("./models/AuthorityRating");
const AuditLog = require("./models/AuditLog");


require("dotenv").config();
const configuredFeedbackWindow = Number.parseInt(
  process.env.FEEDBACK_WINDOW_DAYS || "30",
  10
);
const FEEDBACK_WINDOW_DAYS =
  Number.isInteger(configuredFeedbackWindow) &&
  configuredFeedbackWindow >= 1 &&
  configuredFeedbackWindow <= 365
    ? configuredFeedbackWindow
    : 30;

/* ======================================================
   AUTHENTICATION MIDDLEWARE
   ====================================================== */

// Verifies the JWT and loads the current user from MongoDB.
async function protect(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Your login route creates tokens with an "id" field.
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User account no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "This account is inactive or unavailable.",
      });
    }

    // Use the current database role, not the role stored in the JWT.
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: String(user.role || "").toLowerCase(),
    };

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Your session is invalid or has expired. Please log in again.",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Unable to verify authentication.",
    });
  }
}

/* ======================================================
   AUTHORITY MIDDLEWARE
   ====================================================== */

// Allows approved authorities and admins to access authority routes.
async function authorityOnly(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const role = String(req.user.role || "").toLowerCase();

    // Admins retain access to authority routes.
    if (role === "admin") {
      return next();
    }

    if (role !== "authority") {
      return res.status(403).json({
        message: "Access denied. Authority access is required.",
      });
    }

    const user = await User.findById(req.user.id).select(
      "authorityStatus isActive"
    );

    if (!user || !user.isActive) {
      return res.status(403).json({
        message: "This account is inactive or unavailable.",
      });
    }

    if (user.authorityStatus !== "approved") {
      return res.status(403).json({
        message: "Your authority account is awaiting admin approval.",
        authorityStatus: user.authorityStatus || "pending",
      });
    }

    return next();
  } catch (error) {
    console.error("Authority middleware error:", error);

    return res.status(500).json({
      message: "Unable to verify authority access.",
    });
  }
}

/* ======================================================
   ADMIN MIDDLEWARE
   ====================================================== */

// Only administrators can access admin routes.
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (String(req.user.role || "").toLowerCase() !== "admin") {
    return res.status(403).json({
      message: "Access denied. Administrator access is required.",
    });
  }

  next();
}


// ======================================================
// APP
// ======================================================

const app = express();

// ======================================================
// BASIC MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ======================================================
// STATIC UPLOADS
// ======================================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ======================================================
// EMAIL CONFIGURATION
// ======================================================

const emailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

emailTransporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:");
    console.error(error.message);
  } else {
    console.log("Email transporter is ready");
  }
});

// ======================================================
// CIVIC INTELLIGENCE
// ======================================================

function calculatePriorityScore(category, severity) {
  let score = 50;

  if (category === "Road Damage") score += 10;
  if (category === "Water Leakage") score += 15;
  if (category === "Drainage") score += 15;
  if (category === "Streetlight") score += 5;
  if (category === "Garbage") score += 5;

  if (severity === "Low") score -= 15;
  if (severity === "Medium") score += 0;
  if (severity === "High") score += 20;
  if (severity === "Critical") score += 35;

  return Math.min(Math.max(score, 0), 100);
}

// ======================================================
// NOTIFICATION HELPER
// ======================================================

async function createNotification({
  userId,
  type,
  title,
  message,
  reportId = null,
}) {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      reportId,
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
}

// ======================================================
// ACTIVITY HELPER
// ======================================================

async function createActivity({
  reportId,
  userId,
  action,
  message,
  oldValue = null,
  newValue = null,
}) {
  try {
    await ReportActivity.create({
      reportId,
      userId,
      action,
      message,
      oldValue,
      newValue,
    });
  } catch (error) {
    console.error("Activity error:", error.message);
  }
}

// ======================================================
// NEARBY REPORTS / DUPLICATE DETECTION
// ======================================================

async function findNearbyReports(latitude, longitude) {
  return await Report.find({
    latitude: {
      $gte: Number(latitude) - 0.001,
      $lte: Number(latitude) + 0.001,
    },
    longitude: {
      $gte: Number(longitude) - 0.001,
      $lte: Number(longitude) + 0.001,
    },
  })
    .sort({ createdAt: -1 })
    .limit(20);
}

// ======================================================
// MULTER IMAGE UPLOAD
// ======================================================

const IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + IMAGE_TYPES[file.mimetype]);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: function (req, file, cb) {
    const expectedExtension = IMAGE_TYPES[file.mimetype];
    const suppliedExtension = path.extname(file.originalname).toLowerCase();

    if (
      !expectedExtension ||
      !(
        suppliedExtension === expectedExtension ||
        (file.mimetype === "image/jpeg" &&
          suppliedExtension === ".jpeg")
      )
    ) {
      return cb(new Error("Only JPEG, PNG, and WebP images are allowed."));
    }

    return cb(null, true);
  },
});

async function hasValidImageSignature(file) {
  const handle = await fs.promises.open(file.path, "r");

  try {
    const signature = Buffer.alloc(12);
    const { bytesRead } = await handle.read(
      signature,
      0,
      signature.length,
      0
    );
    const bytes = signature.subarray(0, bytesRead);

    if (file.mimetype === "image/jpeg") {
      return (
        bytes.length >= 3 &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff
      );
    }

    if (file.mimetype === "image/png") {
      return bytes.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );
    }

    if (file.mimetype === "image/webp") {
      return (
        bytes.length >= 12 &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP"
      );
    }

    return false;
  } finally {
    await handle.close();
  }
}

function uploadReportImages(req, res, next) {
  upload.array("image", 5)(req, res, async (error) => {
    if (error) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({
        message:
          error instanceof multer.MulterError
            ? "Upload up to 5 images, each no larger than 5 MB."
            : error.message,
      });
    }

    const files = Array.isArray(req.files) ? req.files : [];

    try {
      const signaturesValid = await Promise.all(
        files.map(hasValidImageSignature)
      );

      if (signaturesValid.some((isValid) => !isValid)) {
        await Promise.all(
          files.map((file) => fs.promises.unlink(file.path))
        );
        return res.status(400).json({
          message: "One or more uploads are not valid image files.",
        });
      }

      return next();
    } catch (validationError) {
      console.error("Image upload validation error:", validationError);
      const cleanupResults = await Promise.allSettled(
        files.map((file) =>
          fs.promises.unlink(file.path)
        )
      );
      cleanupResults
        .filter((result) => result.status === "rejected")
        .forEach((result) => {
          if (result.reason.code !== "ENOENT") {
            console.error("Failed to remove invalid upload:", result.reason);
          }
        });
      return res.status(500).json({
        message: "Unable to validate uploaded images.",
      });
    }
  });
}

// ======================================================
// HOME
// ======================================================
  
app.get("/", (req, res) => {
  res.json({
    message: "CitiZen API is running",
  });
});

// ======================================================
// ADMIN - CREATE AUTHORITY
// ======================================================

app.post(
  "/api/admin/authorities",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { name, email, password, department } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email and password are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(400).json({
          message: "A user with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const authority = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "authority",
        authorityStatus: "approved",
        department: department?.trim() || null,
        isActive: true,
      });

      return res.status(201).json({
        message: "Authority created successfully",
        authority: {
          _id: authority._id,
          name: authority.name,
          email: authority.email,
          role: authority.role,
          authorityStatus: authority.authorityStatus,
          department: authority.department,
        },
      });
    } catch (error) {
      console.error("Create authority error:", error);
      return res.status(500).json({
        message: "Failed to create authority",
      });
    }
  }
);

// ======================================================
// AUTH - REGISTER
// ======================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    // Public registration can never create an admin.
    const requestedRole = String(role || "citizen")
      .trim()
      .toLowerCase();

    if (!["citizen", "authority"].includes(requestedRole)) {
      return res.status(400).json({
        message: "Invalid registration role.",
      });
    }

    if (
      requestedRole === "authority" &&
      !department?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide your department.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAuthority = requestedRole === "authority";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: requestedRole,
      authorityStatus: isAuthority ? "pending" : "not_applicable",
      department: isAuthority ? department.trim() : null,
    });

    return res.status(201).json({
      message: isAuthority
        ? "Registration successful. Your authority account is pending admin approval."
        : "Citizen account registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authorityStatus: user.authorityStatus,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
});


/* ======================================================
   AUTH - LOGIN
   ====================================================== */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Prevent inactive accounts from logging in.
    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account is inactive. Please contact an administrator.",
      });
    }

    // Authorities must be approved before they can log in.
    if (
      user.role === "authority" &&
      user.authorityStatus !== "approved"
    ) {
      return res.status(403).json({
        message:
          "Your authority account is awaiting admin approval.",
        authorityStatus: user.authorityStatus || "pending",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        authorityStatus: user.authorityStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});


// ======================================================
// AUTH - FORGOT PASSWORD
// ======================================================

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Do not reveal whether an account exists.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Continue with the password-reset logic from your existing
    // server.js here. Keep its token generation, email sending,
    // and database update code intact.



      const resetToken =
        jwt.sign(
          {
            id: user._id,
            email: user.email,
            purpose:
              "password-reset",
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "15m",
          }
        );

      const frontendUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:5173";

      const resetLink =
        `${frontendUrl}/reset-password?token=${resetToken}`;

      await emailTransporter.sendMail({
        from:
          `"CitiZen" <${process.env.EMAIL_USER}>`,

        to: user.email,

        subject:
          "CitiZen Password Reset",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              background: #f8fafc;
              border-radius: 15px;
            "
          >

            <h2 style="color: #2563eb;">
              CitiZen Password Reset
            </h2>

            <p>
              Hello ${user.name || "Citizen"},
            </p>

            <p>
              We received a request to reset
              your CitiZen account password.
            </p>

            <p>
              Click the button below to create
              a new password.
            </p>

            <div style="margin: 30px 0;">

              <a
                href="${resetLink}"
                style="
                  display: inline-block;
                  background: #2563eb;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 8px;
                  text-decoration: none;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>

            </div>

            <p>
              This link will expire in
              <strong>15 minutes</strong>.
            </p>

            <p style="color: #666;">
              If you did not request a password
              reset, you can safely ignore this email.
            </p>

            <hr />

            <p
              style="
                color: #64748b;
                font-size: 13px;
              "
            >
              © CitiZen — AI-Powered Civic
              Intelligence Platform
            </p>

          </div>
        `,
      });

      res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to process password reset request.",
      });
    }
  }
);


// ======================================================
// AUTH - RESET PASSWORD
// ======================================================

app.post(
  "/api/auth/reset-password",
  async (req, res) => {
    try {
      const {
        token,
        password,
      } = req.body;

      if (
        !token ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Reset token and new password are required.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters.",
        });
      }

      let decoded;

      try {
        decoded =
          jwt.verify(
            token,
            process.env.JWT_SECRET
          );
      } catch (error) {
        return res.status(400).json({
          message:
            "Reset link is invalid or has expired.",
        });
      }

      if (
        decoded.purpose !==
        "password-reset"
      ) {
        return res.status(400).json({
          message:
            "Invalid password reset token.",
        });
      }

      const user =
        await User.findById(
          decoded.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      user.password =
        hashedPassword;

      await user.save();

      res.status(200).json({
        message:
          "Password reset successful. You can now login with your new password.",
      });

    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to reset password.",
      });
    }
  }
);


// ======================================================
// CURRENT USER
// ======================================================

app.get(
  "/api/auth/me",
  protect,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.status(200).json({
        user,
      });

    } catch (error) {
      console.error(
        "Get user error:",
        error
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);


// ======================================================
// CREATE REPORT
// ======================================================

app.post(
  "/api/reports",
  protect,
  uploadReportImages,
  async (req, res) => {
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    let reportCreated = false;

    try {
      const {
        title,
        description,
        category,
        location,
        latitude,
        longitude,
        severity,
      } = req.body;

      if (
        !title ||
        !description ||
        !category ||
        !location ||
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          message:
            "All fields are required",
        });
      }

      const allowedCategories = [
        "Road Damage",
        "Garbage",
        "Streetlight",
        "Water Leakage",
        "Drainage",
        "Other",
      ];
      const allowedSeverities = [
        "Low",
        "Medium",
        "High",
        "Critical",
      ];

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          message: "Choose a valid report category",
        });
      }

      if (
        severity !== undefined &&
        !allowedSeverities.includes(severity)
      ) {
        return res.status(400).json({
          message: "Choose a valid severity",
        });
      }

      if (
        title.trim().length > 120 ||
        description.trim().length > 2000 ||
        location.trim().length > 500
      ) {
        return res.status(400).json({
          message: "One or more report fields exceed the allowed length",
        });
      }

      const numericLatitude =
        Number(latitude);

      const numericLongitude =
        Number(longitude);

      if (
        !Number.isFinite(
          numericLatitude
        ) ||
        !Number.isFinite(
          numericLongitude
        )
      ) {
        return res.status(400).json({
          message:
            "Latitude and longitude must be valid numbers",
        });
      }

      if (
        numericLatitude < -90 ||
        numericLatitude > 90 ||
        numericLongitude < -180 ||
        numericLongitude > 180
      ) {
        return res.status(400).json({
          message:
            "Invalid latitude or longitude",
        });
      }

      const selectedSeverity =
        severity || "Medium";

      const priorityScore =
        calculatePriorityScore(
          category,
          selectedSeverity
        );

      // ==================================================
      // DUPLICATE DETECTION
      // ==================================================

      const nearbyReports =
        await findNearbyReports(
          numericLatitude,
          numericLongitude
        );

      let duplicateOf = null;

      const possibleDuplicate =
        nearbyReports.find(
          (existingReport) =>
            existingReport.category ===
              category &&
            existingReport.status !==
              "Resolved"
        );

      if (possibleDuplicate) {
        duplicateOf =
          possibleDuplicate._id;

        possibleDuplicate.duplicateCount =
          (possibleDuplicate.duplicateCount || 0) +
          1;

        await possibleDuplicate.save();
      }

      // ==================================================
      // CREATE REPORT
      // ==================================================

      const report =
        await Report.create({
          userId:
            req.user.id,

          title:
            title.trim(),

          description:
            description.trim(),

          category,

          location:
            location.trim(),

          imageUrls: uploadedFiles.map(
            (file) => `/uploads/${file.filename}`
          ),

          latitude:
            numericLatitude,

          longitude:
            numericLongitude,

          imageUrl:
            uploadedFiles.length
              ? `/uploads/${uploadedFiles[0].filename}`
              : null,

          status:
            "Reported",

          severity:
            selectedSeverity,

          priorityScore,

          aiVerified:
            false,

          aiCategory:
            null,

          aiConfidence:
            null,

          duplicateOf,

          appreciationCount:
            0,

          commentCount:
            0,

          assignedTo:
            null,

          appreciatedBy:
            [],

          resolutionNote:
            null,

          resolvedAt:
            null,

          duplicateCount:
            0,

          statusHistory: [
            {
              status:
                "Reported",

              changedBy:
                req.user.id,

              note:
                "Report created",
            },
          ],
        });
      reportCreated = true;

      // ==================================================
      // ACTIVITY
      // ==================================================

      await createActivity({
        reportId:
          report._id,

        userId:
          req.user.id,

        action:
          "CREATED",

        message:
          "Report was created",
      });

      // ==================================================
      // DUPLICATE NOTIFICATION
      // ==================================================

      if (duplicateOf) {
        await createNotification({
          userId:
            req.user.id,

          type:
            "DUPLICATE_DETECTED",

          title:
            "Possible duplicate report",

          message:
            "A similar civic issue has already been reported nearby.",

          reportId:
            report._id,
        });
      }

      res.status(201).json({
        message:
          "Report created successfully",

        report,

        duplicateDetected:
          Boolean(duplicateOf),
      });

    } catch (error) {
      console.error(
        "Create report error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create report",
      });
    } finally {
      if (!reportCreated && uploadedFiles.length) {
        const cleanupResults = await Promise.allSettled(
          uploadedFiles.map((file) => fs.promises.unlink(file.path))
        );
        cleanupResults
          .filter((result) => result.status === "rejected")
          .forEach((result) => {
            if (result.reason.code !== "ENOENT") {
              console.error(
                "Failed to remove report upload after rejection:",
                result.reason
              );
            }
          });
      }
    }
  }
);


// ======================================================
// MY REPORTS
// ======================================================

app.get(
  "/api/reports/my",
  protect,
  async (req, res) => {
    try {
      const reports =
        await Report.find({
          userId:
            req.user.id,
        })
          .populate(
            "assignedTo",
            "name email role"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        reports,
      });

    } catch (error) {
      console.error(
        "Fetch my reports error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch reports",
      });
    }
  }
);


// ======================================================
// ALL REPORTS
// ======================================================

app.get(
  "/api/reports",
  async (req, res) => {
    try {
      const reports =
        await Report.find()
          .populate(
            "userId",
            "name"
          )
          .populate(
            "assignedTo",
            "name email role"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        reports,
      });

    } catch (error) {
      console.error(
        "Fetch all reports error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch reports",
      });
    }
  }
);


// ======================================================
// REPORT STATISTICS
// ======================================================

app.get(
  "/api/reports/stats",
  async (req, res) => {
    try {
      const [
        total,
        reported,
        underReview,
        assigned,
        inProgress,
        resolved,
        categoryStats,
      ] =
        await Promise.all([
          Report.countDocuments(),

          Report.countDocuments({
            status:
              "Reported",
          }),

          Report.countDocuments({
            status:
              "Under Review",
          }),

          Report.countDocuments({
            status:
              "Assigned",
          }),

          Report.countDocuments({
            status:
              "In Progress",
          }),

          Report.countDocuments({
            status:
              "Resolved",
          }),

          Report.aggregate([
            {
              $group: {
                _id:
                  "$category",

                count: {
                  $sum: 1,
                },
              },
            },

            {
              $sort: {
                count: -1,
              },
            },
          ]),
        ]);

      res.status(200).json({
        total,
        reported,
        underReview,
        assigned,
        inProgress,
        resolved,
        categoryStats,
      });

    } catch (error) {
      console.error(
        "Stats error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch report statistics",
      });
    }
  }
);


// ======================================================
// COMMENTS - ADD
// ======================================================

app.post(
  "/api/reports/:id/comments",
  protect,
  async (req, res) => {
    try {
      const { text } =
        req.body;

      if (
        !text ||
        !text.trim()
      ) {
        return res.status(400).json({
          message:
            "Comment cannot be empty",
        });
      }

      const report =
        await Report.findById(
          req.params.id
        );

      if (!report) {
        return res.status(404).json({
          message:
            "Report not found",
        });
      }

      const comment =
        await Comment.create({
          reportId:
            report._id,

          userId:
            req.user.id,

          text:
            text.trim(),
        });

      report.commentCount =
        (report.commentCount || 0) +
        1;

      await report.save();

      await createActivity({
        reportId:
          report._id,

        userId:
          req.user.id,

        action:
          "COMMENTED",

        message:
          "A comment was added",
      });

      res.status(201).json({
        message:
          "Comment added",

        comment,
      });

    } catch (error) {
      console.error(
        "Comment error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to add comment",
      });
    }
  }
);


// ======================================================
// COMMENTS - GET
// ======================================================

app.get(
  "/api/reports/:id/comments",
  async (req, res) => {
    try {
      const comments =
        await Comment.find({
          reportId:
            req.params.id,
        })
          .populate(
            "userId",
            "name role"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        comments,
      });

    } catch (error) {
      console.error(
        "Get comments error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch comments",
      });
    }
  }
);


// ======================================================
// APPRECIATION
// ======================================================

app.post(
  "/api/reports/:id/appreciate",
  protect,
  async (req, res) => {
    try {
      const report =
        await Report.findById(
          req.params.id
        );

      if (!report) {
        return res.status(404).json({
          message:
            "Report not found",
        });
      }

      if (!report.appreciatedBy) {
        report.appreciatedBy = [];
      }

      const alreadyAppreciated =
        report.appreciatedBy.some(
          (id) =>
            id.toString() ===
            req.user.id.toString()
        );

      if (alreadyAppreciated) {
        return res.status(200).json({
          message: "You already appreciated this report.",
          alreadyAppreciated: true,
          appreciationCount: report.appreciationCount || 0,
        });
      }

      report.appreciatedBy.push(
        req.user.id
      );

      report.appreciationCount =
        (report.appreciationCount || 0) +
        1;

      await report.save();

      await createActivity({
        reportId:
          report._id,

        userId:
          req.user.id,

        action:
          "APPRECIATED",

        message:
          "Report received appreciation",
      });

      res.status(200).json({
        message:
          "Appreciation added",

        appreciationCount:
          report.appreciationCount,
      });

    } catch (error) {
      console.error(
        "Appreciation error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to appreciate report",
      });
    }
  }
);

app.get(
  "/api/reports/:id/rating",
  protect,
  async (req, res) => {
    try {
      if (req.user.role !== "citizen") {
        return res.status(403).json({
          message: "Only citizens can rate report resolutions.",
        });
      }

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid report ID.",
        });
      }

      const report = await Report.findById(req.params.id).select(
        "userId assignedTo status resolutionCycle resolvedAt"
      );

      if (!report) {
        return res.status(404).json({
          message: "Report not found.",
        });
      }

      if (report.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          message: "Only the citizen who submitted this report can rate it.",
        });
      }

      const rating = await AuthorityRating.findOne({
        reportId: report._id,
        citizenId: req.user.id,
        resolutionCycle: Math.max(report.resolutionCycle || 0, 1),
      }).lean();

      return res.status(200).json({
        eligible:
          report.status === "Resolved" &&
          Boolean(report.assignedTo) &&
          report.assignedTo.toString() !== req.user.id.toString(),
        rating,
        feedbackWindowDays: FEEDBACK_WINDOW_DAYS,
      });
    } catch (error) {
      console.error("Get authority rating error:", error);
      return res.status(500).json({
        message: "Unable to load report rating.",
      });
    }
  }
);

app.post(
  "/api/reports/:id/rating",
  protect,
  async (req, res) => {
    try {
      if (req.user.role !== "citizen") {
        return res.status(403).json({
          message: "Only citizens can rate report resolutions.",
        });
      }

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid report ID.",
        });
      }

      const scoreFields = [
        "resolutionQuality",
        "responsiveness",
        "communication",
        "professionalism",
        "overallSatisfaction",
      ];

      for (const field of scoreFields) {
        if (
          !Number.isInteger(req.body[field]) ||
          req.body[field] < 1 ||
          req.body[field] > 5
        ) {
          return res.status(400).json({
            message: `${field} must be a whole number from 1 to 5.`,
          });
        }
      }

      const review =
        typeof req.body.review === "string"
          ? req.body.review.trim()
          : "";

      if (review.length > 1000) {
        return res.status(400).json({
          message: "Review must be 1000 characters or fewer.",
        });
      }

      const report = await Report.findById(req.params.id);
      if (!report) {
        return res.status(404).json({
          message: "Report not found.",
        });
      }

      if (report.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          message: "Only the citizen who submitted this report can rate it.",
        });
      }

      if (report.status !== "Resolved" || !report.resolvedAt) {
        return res.status(409).json({
          message: "You can rate the authority after the report is resolved.",
        });
      }

      const authority = await User.findOne({
        _id: report.assignedTo,
        role: "authority",
      }).select("_id department");

      if (!authority) {
        return res.status(409).json({
          message:
            "This resolution has no assigned authority to rate.",
        });
      }

      const resolutionCycle = Math.max(report.resolutionCycle || 0, 1);
      let rating = await AuthorityRating.findOne({
        reportId: report._id,
        citizenId: req.user.id,
        resolutionCycle,
      });

      if (rating) {
        const feedbackWindowMs =
          FEEDBACK_WINDOW_DAYS * 24 * 60 * 60 * 1000;

        if (
          Date.now() - rating.createdAt.getTime() >
          feedbackWindowMs
        ) {
          return res.status(403).json({
            message: `Ratings can only be edited within ${FEEDBACK_WINDOW_DAYS} days of submission.`,
          });
        }
      } else {
        rating = new AuthorityRating({
          reportId: report._id,
          citizenId: req.user.id,
          authorityId: authority._id,
          department: authority.department,
          resolutionCycle,
        });
      }

      for (const field of scoreFields) {
        rating[field] = req.body[field];
      }
      rating.review = review;
      await rating.save();

      return res.status(200).json({
        message: "Thank you. Your resolution feedback has been saved.",
        rating,
        feedbackWindowDays: FEEDBACK_WINDOW_DAYS,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "A rating for this resolution has already been submitted.",
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "The rating data is invalid.",
        });
      }

      console.error("Submit authority rating error:", error);
      return res.status(500).json({
        message: "Unable to save resolution feedback.",
      });
    }
  }
);


// ======================================================
// REPORT TIMELINE
// ======================================================

app.get(
  "/api/reports/:id/activity",
  async (req, res) => {
    try {
      const activities =
        await ReportActivity.find({
          reportId:
            req.params.id,
        })
          .populate(
            "userId",
            "name role"
          )
          .sort({
            createdAt: 1,
          });

      res.status(200).json({
        activities,
      });

    } catch (error) {
      console.error(
        "Activity error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch activity",
      });
    }
  }
);


// ======================================================
// GET AUTHORITY USERS
// ======================================================

app.get(
  "/api/users/authorities",
  protect,
  authorityOnly,
  async (req, res) => {
    try {
      const authorities =
        await User.find({
          role: {
            $in: [
              "authority",
              "admin",
            ],
          },
        })
          .select(
            "_id name email role"
          )
          .sort({
            name: 1,
          });

      res.status(200).json({
        authorities,
      });

    } catch (error) {
      console.error(
        "Authorities error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch authorities",
      });
    }
  }
);


// ======================================================
// ASSIGN REPORT TO AUTHORITY
// ======================================================

app.patch(
  "/api/reports/:id/assign",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        authorityId,
      } = req.body;

      if (
        !mongoose.isValidObjectId(req.params.id) ||
        !mongoose.isValidObjectId(authorityId)
      ) {
        return res.status(400).json({
          message: "A valid report ID and authority ID are required.",
        });
      }

      const authority = await User.findOne({
        _id: authorityId,
        role: "authority",
        authorityStatus: "approved",
        isActive: true,
      });

      if (!authority) {
        return res.status(400).json({
          message: "Select an active, approved authority.",
        });
      }

      const report =
        await Report.findById(
          req.params.id
        );

      if (!report) {
        return res.status(404).json({
          message:
            "Report not found",
        });
      }

      const oldAssignedTo =
        report.assignedTo;

      report.assignedTo =
        authority._id;
      report.assignedAt = new Date();
      report.assignedBy = req.user.id;
      report.assignmentHistory.push({
        assignedTo: authority._id,
        assignedBy: req.user.id,
        assignedAt: report.assignedAt,
        previousAuthority: oldAssignedTo || null,
      });

      report.status =
        "Assigned";

      if (!report.statusHistory) {
        report.statusHistory = [];
      }

      report.statusHistory.push({
        status:
          "Assigned",

        changedBy:
          req.user.id,

        note:
          `Assigned to ${authority.name}`,
      });

      await report.save();

      await createActivity({
        reportId:
          report._id,

        userId:
          req.user.id,

        action:
          "ASSIGNED",

        message:
          `Report assigned to ${authority.name}`,

        oldValue:
          oldAssignedTo
            ? oldAssignedTo.toString()
            : null,

        newValue:
          authority._id.toString(),
      });

      await AuditLog.create({
        actorId: req.user.id,
        action: oldAssignedTo ? "REPORT_REASSIGNED" : "REPORT_ASSIGNED",
        targetUserId: authority._id,
        targetReportId: report._id,
        summary: oldAssignedTo
          ? `Report reassigned to ${authority.name}`
          : `Report assigned to ${authority.name}`,
        metadata: {
          previousAuthorityId: oldAssignedTo || null,
        },
      });

      await createNotification({
        userId:
          authority._id,

        type:
          "REPORT_ASSIGNED",

        title:
          "New report assigned",

        message:
          `You have been assigned report "${report.title}".`,

        reportId:
          report._id,
      });

      res.status(200).json({
        success: true,
        message:
          "Report assigned successfully",

        report: await Report.findById(report._id)
          .populate("userId", "name email")
          .populate("assignedTo", "name email role department")
          .populate("assignedBy", "name role")
          .populate("assignmentHistory.assignedTo", "name role department")
          .populate("assignmentHistory.assignedBy", "name role")
          .populate("assignmentHistory.previousAuthority", "name role department"),
      });

    } catch (error) {
      console.error(
        "Assignment error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to assign report",
      });
    }
  }
);


// ======================================================
// AUTHORITY DASHBOARD
// ======================================================

app.get(
  "/api/authority/dashboard",
  protect,
  authorityOnly,
  async (req, res) => {
    try {
      const assigned =
        await Report.countDocuments({
          assignedTo:
            req.user.id,
        });

      const inProgress =
        await Report.countDocuments({
          assignedTo:
            req.user.id,

          status:
            "In Progress",
        });

      const resolved =
        await Report.countDocuments({
          assignedTo:
            req.user.id,

          status:
            "Resolved",
        });

      const critical =
        await Report.countDocuments({
          assignedTo:
            req.user.id,

          severity:
            "Critical",

          status: {
            $ne:
              "Resolved",
          },
        });

      res.status(200).json({
        assigned,
        inProgress,
        resolved,
        critical,
      });

    } catch (error) {
      console.error(
        "Authority dashboard error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load authority dashboard",
      });
    }
  }
);


// ======================================================
// AUTHORITY REPORT QUEUE
// ======================================================

app.get(
  "/api/authority/reports",
  protect,
  authorityOnly,
  async (req, res) => {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(
        50,
        Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
      );
      const filter = { assignedTo: req.user.id };
      const validStatuses = [
        "Reported",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
      ];
      const validCategories = [
        "Road Damage",
        "Garbage",
        "Streetlight",
        "Water Leakage",
        "Drainage",
        "Other",
      ];

      if (req.query.status) {
        if (!validStatuses.includes(req.query.status)) {
          return res.status(400).json({ message: "Invalid status filter." });
        }
        filter.status = req.query.status;
      }

      if (req.query.category) {
        if (!validCategories.includes(req.query.category)) {
          return res.status(400).json({ message: "Invalid category filter." });
        }
        filter.category = req.query.category;
      }

      const priorityRanges = {
        Critical: { $gte: 90 },
        High: { $gte: 70, $lt: 90 },
        Normal: { $gte: 40, $lt: 70 },
        Low: { $lt: 40 },
      };
      if (req.query.priority) {
        const range = priorityRanges[req.query.priority];
        if (!range) {
          return res.status(400).json({ message: "Invalid priority filter." });
        }
        filter.priorityScore = range;
      }

      const search =
        typeof req.query.search === "string"
          ? req.query.search.trim().slice(0, 100)
          : "";
      if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
          { title: { $regex: escapedSearch, $options: "i" } },
          { description: { $regex: escapedSearch, $options: "i" } },
          { location: { $regex: escapedSearch, $options: "i" } },
        ];
      }

      const assignedTo = { assignedTo: req.user.id };
      const [reports, total, counts] = await Promise.all([
        Report.find(filter)
          .populate("userId", "name")
          .populate("assignedTo", "name role department")
          .sort({ priorityScore: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Report.countDocuments(filter),
        Promise.all([
          Report.countDocuments(assignedTo),
          Report.countDocuments({ ...assignedTo, status: "In Progress" }),
          Report.countDocuments({ ...assignedTo, status: "Resolved" }),
          Report.countDocuments({ ...assignedTo, severity: "Critical", status: { $ne: "Resolved" } }),
        ]).then(([assigned, inProgress, resolved, critical]) => ({
          assigned,
          inProgress,
          resolved,
          critical,
        })),
      ]);

      res.status(200).json({
        success: true,
        reports,
        counts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      console.error(
        "Authority reports error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch authority reports",
      });
    }
  }
);


// ======================================================
// UPDATE REPORT STATUS
// ======================================================

app.patch(
  "/api/reports/:id/status",
  protect,
  authorityOnly,
  async (req, res) => {
    try {
      const {
        status,
        note = "",
      } = req.body;

      const validStatuses = [
        "Reported",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
      ];

      if (
        !validStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid status",
        });
      }

      let report =
        await Report.findById(
          req.params.id
        );

      if (!report) {
        return res.status(404).json({
          message:
            "Report not found",
        });
      }

      // Only the assigned authority
      // or admin should update it.

      const isAdmin =
        req.user.role ===
        "admin";

      const isAssignedAuthority =
        report.assignedTo &&
        report.assignedTo.toString() ===
          req.user.id.toString();

      if (
        !isAdmin &&
        !isAssignedAuthority
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to update this report",
        });
      }

      const oldStatus =
        report.status;

      report.status =
        status;

      if (status === "Resolved" && oldStatus !== "Resolved") {
        report.resolutionCycle =
          (report.resolutionCycle || 0) + 1;
      }

      if (!report.statusHistory) {
        report.statusHistory = [];
      }

      report.statusHistory.push({
        status,

        changedBy:
          req.user.id,

        note,
      });

      if (
        status ===
        "Resolved"
      ) {
        report.resolvedAt =
          new Date();
      } else {
        report.resolvedAt =
          null;
      }

      await report.save();

      await createActivity({
        reportId:
          report._id,

        userId:
          req.user.id,

        action:
          status ===
          "Resolved"
            ? "RESOLVED"
            : "STATUS_CHANGED",

        message:
          status ===
          "Resolved"
            ? "Report has been resolved"
            : `Status changed to ${status}`,

        oldValue:
          oldStatus,

        newValue:
          status,
      });

      await createNotification({
        userId:
          report.userId,

        type:
          status ===
          "Resolved"
            ? "REPORT_RESOLVED"
            : "STATUS_UPDATED",

        title:
          status ===
          "Resolved"
            ? "Your report was resolved"
            : "Report status updated",

        message:
          `Your report "${report.title}" is now ${status}.`,

        reportId:
          report._id,
      });

      res.status(200).json({
        message:
          "Report status updated successfully",

        report,
      });

    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update report status",
      });
    }
  }
);


// ======================================================
// RESOLVE REPORT
// ======================================================

app.patch(
  "/api/reports/:id/resolve",
  protect,
  authorityOnly,
  async (req, res) => {
    try {
      const {
        resolutionNote,
      } = req.body;

      const isAdmin =
        req.user.role ===
        "admin";

      const query = isAdmin
        ? {
            _id:
              req.params.id,
          }
        : {
            _id:
              req.params.id,

            assignedTo:
              req.user.id,
          };

      const report =
        await Report.findOne(
          query
        );

      if (!report) {
        return res.status(404).json({
          message:
            "Report not found or not assigned to you",
        });
      }

      const oldStatus =
        report.status;

      if (oldStatus !== "Resolved") {
        report.resolutionCycle =
          (report.resolutionCycle || 0) + 1;
      }

      report.status =
        "Resolved";

      report.resolutionNote =
        resolutionNote ||
        "Issue resolved";

      report.resolvedAt =
        new Date();

      if (!report.statusHistory) {
        report.statusHistory = [];
      }

      report.statusHistory.push({
        status:
          "Resolved",

        changedBy:
          req.user.id,

        note:
          resolutionNote ||
          "Issue resolved",
      });

      await report.save();

      await createActivity({
        reportId:
          report._id,

        userId:
          req.user.id,

        action:
          "RESOLVED",

        message:
          "Authority marked issue as resolved",

        oldValue:
          oldStatus,

        newValue:
          "Resolved",
      });

      await createNotification({
        userId:
          report.userId,

        type:
          "REPORT_RESOLVED",

        title:
          "Issue resolved",

        message:
          `Your report "${report.title}" has been resolved.`,

        reportId:
          report._id,
      });

      res.status(200).json({
        message:
          "Report resolved",

        report,
      });

    } catch (error) {
      console.error(
        "Resolve report error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to resolve report",
      });
    }
  }
);


// ======================================================
// NOTIFICATIONS - GET
// ======================================================

app.get(
  "/api/notifications",
  protect,
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          userId:
            req.user.id,
        })
          .populate(
            "reportId",
            "title status"
          )
          .sort({
            createdAt: -1,
          })
          .limit(50);

      res.status(200).json({
        notifications,
      });

    } catch (error) {
      console.error(
        "Notification error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch notifications",
      });
    }
  }
);


// ======================================================
// MARK NOTIFICATION READ
// ======================================================

app.patch(
  "/api/notifications/read-all",
  protect,
  async (req, res) => {
    try {
      const result = await Notification.updateMany(
        {
          userId: req.user.id,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      return res.status(200).json({
        message: "Notifications marked as read",
        updatedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      return res.status(500).json({
        message: "Failed to update notifications",
      });
    }
  }
);

app.patch(
  "/api/notifications/:id/read",
  protect,
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id:
            req.params.id,

          userId:
            req.user.id,
        });

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      notification.read =
        true;

      await notification.save();

      res.status(200).json({
        message:
          "Notification marked as read",
      });

    } catch (error) {
      console.error(
        "Notification read error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update notification",
      });
    }
  }
);


// ======================================================
// UNREAD NOTIFICATION COUNT
// ======================================================

app.get(
  "/api/notifications/unread-count",
  protect,
  async (req, res) => {
    try {
      const count =
        await Notification.countDocuments({
          userId:
            req.user.id,

          read:
            false,
        });

      res.status(200).json({
        count,
      });

    } catch (error) {
      console.error(
        "Unread notification error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch notification count",
      });
    }
  }
);


// ======================================================
// CIVIC ANALYTICS
// ======================================================

app.get(
  "/api/reports/analytics",
  async (req, res) => {
    try {
      const [
        totalReports,
        resolvedReports,
        pendingReports,
        highPriorityReports,
        categoryStats,
        statusStats,
      ] =
        await Promise.all([
          Report.countDocuments(),

          Report.countDocuments({
            status:
              "Resolved",
          }),

          Report.countDocuments({
            status: {
              $ne:
                "Resolved",
            },
          }),

          Report.countDocuments({
            priorityScore: {
              $gte: 70,
            },
          }),

          Report.aggregate([
            {
              $group: {
                _id:
                  "$category",

                count: {
                  $sum: 1,
                },
              },
            },

            {
              $sort: {
                count: -1,
              },
            },
          ]),

          Report.aggregate([
            {
              $group: {
                _id:
                  "$status",

                count: {
                  $sum: 1,
                },
              },
            },

            {
              $sort: {
                count: -1,
              },
            },
          ]),
        ]);

      res.status(200).json({
        totalReports,
        resolvedReports,
        pendingReports,
        highPriorityReports,
        categoryStats,
        statusStats,
      });

    } catch (error) {
      console.error(
        "Analytics error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load analytics",
      });
    }
  }
);


// ======================================================
// RECENT REPORTS
// ======================================================

app.get(
  "/api/reports/recent",
  async (req, res) => {
    try {
      const reports =
        await Report.find()
          .sort({
            createdAt: -1,
          })
          .limit(10);

      res.status(200).json({
        reports,
      });

    } catch (error) {
      console.error(
        "Recent reports error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch recent reports",
      });
    }
  }
);


// ======================================================
// HIGH PRIORITY REPORTS
// ======================================================

app.get(
  "/api/reports/high-priority",
  async (req, res) => {
    try {
      const reports =
        await Report.find({
          priorityScore: {
            $gte: 70,
          },

          status: {
            $ne:
              "Resolved",
          },
        })
          .sort({
            priorityScore: -1,

            createdAt: -1,
          })
          .limit(20);

      res.status(200).json({
        reports,
      });

    } catch (error) {
      console.error(
        "High priority error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch high priority reports",
      });
    }
  }
);

// ======================================================
// SIMILAR REPORT SUGGESTIONS
// ======================================================

app.get(
  "/api/reports/similar",
  async (req, res) => {
    try {
      const latitude = Number(req.query.latitude);
      const longitude = Number(req.query.longitude);
      const category =
        typeof req.query.category === "string"
          ? req.query.category.trim()
          : "";
      const description =
        typeof req.query.description === "string"
          ? req.query.description.trim()
          : "";

      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          message: "Valid latitude and longitude are required",
        });
      }

      if (description.length > 500) {
        return res.status(400).json({
          message: "Description must be 500 characters or fewer",
        });
      }

      if (!category && description.length < 5) {
        return res.status(400).json({
          message: "Provide a category or a longer description",
        });
      }

      const longitudeRadius = Math.min(
        0.1,
        0.01 / Math.max(Math.cos((latitude * Math.PI) / 180), 0.1)
      );
      const candidates = await Report.find({
        latitude: {
          $gte: latitude - 0.01,
          $lte: latitude + 0.01,
        },
        longitude: {
          $gte: longitude - longitudeRadius,
          $lte: longitude + longitudeRadius,
        },
      })
        .select(
          "title description category status severity priorityScore createdAt latitude longitude"
        )
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      const tokens = (value) =>
        new Set(
          value
            .toLowerCase()
            .match(/[a-z0-9]{3,}/g) || []
        );
      const inputTokens = tokens(description);
      const toRadians = (degrees) => (degrees * Math.PI) / 180;

      const suggestions = candidates
        .map((report) => {
          const latitudeDifference = toRadians(
            report.latitude - latitude
          );
          const longitudeDifference = toRadians(
            report.longitude - longitude
          );
          const haversine =
            Math.sin(latitudeDifference / 2) ** 2 +
            Math.cos(toRadians(latitude)) *
              Math.cos(toRadians(report.latitude)) *
              Math.sin(longitudeDifference / 2) ** 2;
          const distanceMeters =
            6_371_000 *
            2 *
            Math.atan2(
              Math.sqrt(haversine),
              Math.sqrt(1 - haversine)
            );

          const reportTokens = tokens(
            `${report.title} ${report.description}`
          );
          const intersection = [...inputTokens].filter((token) =>
            reportTokens.has(token)
          ).length;
          const union = new Set([...inputTokens, ...reportTokens]).size;
          const textSimilarity = union ? intersection / union : 0;
          const categoryMatch =
            Boolean(category) && report.category === category;

          if (
            distanceMeters > 1000 ||
            (!categoryMatch && textSimilarity < 0.1)
          ) {
            return null;
          }

          const score =
            (categoryMatch ? 0.55 : 0) +
            textSimilarity * 0.35 +
            Math.max(0, 1 - distanceMeters / 1000) * 0.1;
          const reasons = [];

          if (categoryMatch) reasons.push("same category");
          if (textSimilarity >= 0.1) reasons.push("similar description terms");
          reasons.push(`about ${Math.round(distanceMeters)} m away`);

          return {
            id: report._id,
            title: report.title,
            category: report.category,
            status: report.status,
            severity: report.severity,
            priorityScore: report.priorityScore,
            createdAt: report.createdAt,
            distanceMeters: Math.round(distanceMeters),
            similarity: Math.round(score * 100),
            explanation: reasons.join(" · "),
          };
        })
        .filter(Boolean)
        .sort(
          (first, second) =>
            second.similarity - first.similarity ||
            first.distanceMeters - second.distanceMeters
        )
        .slice(0, 5);

      return res.status(200).json({ suggestions });
    } catch (error) {
      console.error("Similar report lookup error:", error);
      return res.status(500).json({
        message: "Failed to find similar reports",
      });
    }
  }
);


// ======================================================
// SINGLE REPORT
// ======================================================

app.get(
  "/api/reports/:id",
  async (req, res) => {
    try {
      const report =
        await Report.findById(
          req.params.id
        )
          .populate(
            "userId",
            "name"
          )
          .populate(
            "assignedTo",
            "name email role"
          )
          .populate(
            "duplicateOf",
            "title status category location"
          );

      if (!report) {
        return res.status(404).json({
          message:
            "Report not found",
        });
      }

      res.status(200).json({
        report,
      });

    } catch (error) {
      console.error(
        "Single report error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch report",
      });
    }
  }
);


// ======================================================
// USER PROFILE
// ======================================================

app.get(
  "/api/profile",
  protect,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.status(200).json({
        user,
      });

    } catch (error) {
      console.error(
        "Profile error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch profile",
      });
    }
  }
);


// ======================================================
// CIVIC DASHBOARD
// ======================================================

app.get(
  "/api/dashboard/citizen",
  protect,
  async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);

      const [
        [summary = {}],
        priorityGroups,
        recentReports,
        [resolutionStats = {}],
      ] = await Promise.all([
        Report.aggregate([
          {
            $match: {
              userId,
            },
          },
          {
            $group: {
              _id: null,
              totalReports: { $sum: 1 },
              resolvedReports: {
                $sum: {
                  $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0],
                },
              },
              pendingReports: {
                $sum: {
                  $cond: [{ $eq: ["$status", "Reported"] }, 1, 0],
                },
              },
              underReviewReports: {
                $sum: {
                  $cond: [{ $eq: ["$status", "Under Review"] }, 1, 0],
                },
              },
              assignedReports: {
                $sum: {
                  $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0],
                },
              },
              inProgressReports: {
                $sum: {
                  $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0],
                },
              },
            },
          },
        ]),
        Report.aggregate([
          {
            $match: {
              userId,
            },
          },
          {
            $group: {
              _id: {
                $switch: {
                  branches: [
                    {
                      case: { $gte: ["$priorityScore", 90] },
                      then: "Critical",
                    },
                    {
                      case: { $gte: ["$priorityScore", 70] },
                      then: "High",
                    },
                    {
                      case: { $gte: ["$priorityScore", 40] },
                      then: "Normal",
                    },
                  ],
                  default: "Low",
                },
              },
              count: { $sum: 1 },
            },
          },
        ]),
        Report.find({ userId })
          .select(
            "title category status severity priorityScore location imageUrl resolutionNote createdAt updatedAt assignedTo duplicateOf commentCount appreciationCount"
          )
          .populate("assignedTo", "name department")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        Report.aggregate([
          {
            $match: {
              userId,
              status: "Resolved",
              resolvedAt: { $type: "date" },
            },
          },
          {
            $project: {
              resolutionTimeMs: {
                $subtract: ["$resolvedAt", "$createdAt"],
              },
            },
          },
          {
            $group: {
              _id: null,
              sampleSize: { $sum: 1 },
              averageResolutionTimeMs: {
                $avg: "$resolutionTimeMs",
              },
            },
          },
        ]),
      ]);

      const recentReportIds = (await Report.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select("_id")
        .lean()).map(({ _id }) => _id);

      const recentActivity = recentReportIds.length
        ? await ReportActivity.find({
            reportId: { $in: recentReportIds },
          })
            .populate("userId", "name role")
            .populate("reportId", "title")
            .sort({ createdAt: -1 })
            .limit(8)
            .lean()
        : [];

      const averageResolutionHours =
        resolutionStats.sampleSize >= 5
          ? Math.round(
              (resolutionStats.averageResolutionTimeMs / 3_600_000) * 10
            ) / 10
          : null;

      return res.status(200).json({
        summary: {
          totalReports: summary.totalReports || 0,
          resolvedReports: summary.resolvedReports || 0,
          pendingReports: summary.pendingReports || 0,
          underReviewReports: summary.underReviewReports || 0,
          assignedReports: summary.assignedReports || 0,
          inProgressReports: summary.inProgressReports || 0,
        },
        priorityDistribution: priorityGroups.map(({ _id, count }) => ({
          priority: _id,
          count,
        })),
        averageResolutionHours,
        averageResolutionSampleSize: resolutionStats.sampleSize || 0,
        recentReports,
        recentActivity,
      });
    } catch (error) {
      console.error("Citizen dashboard error:", error);
      return res.status(500).json({
        message: "Failed to load citizen dashboard",
      });
    }
  }
);

app.get(
  "/api/dashboard",
  protect,
  async (req, res) => {
    try {
      const [
        totalReports,
        resolvedReports,
        activeReports,
        criticalReports,
      ] =
        await Promise.all([
          Report.countDocuments(),

          Report.countDocuments({
            status:
              "Resolved",
          }),

          Report.countDocuments({
            status: {
              $ne:
                "Resolved",
            },
          }),

          Report.countDocuments({
            severity:
              "Critical",

            status: {
              $ne:
                "Resolved",
            },
          }),
        ]);

      const resolutionRate =
        totalReports === 0
          ? 0
          : Math.round(
              (resolvedReports /
                totalReports) *
                100
            );

      res.status(200).json({
        totalReports,
        resolvedReports,
        activeReports,
        criticalReports,
        resolutionRate,
      });

    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load dashboard",
      });
    }
  }
);


// ======================================================
// ADMIN DASHBOARD
// ======================================================

app.get(
  "/api/admin/dashboard",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const [
        totalUsers,
        totalAuthorities,
        totalReports,
        resolvedReports,
      ] =
        await Promise.all([
          User.countDocuments({
            role:
              "citizen",
          }),

          User.countDocuments({
            role:
              "authority",
          }),

          Report.countDocuments(),

          Report.countDocuments({
            status:
              "Resolved",
          }),
        ]);

      const users =
        await User.find()
          .select(
            "_id name email role authorityStatus department isActive createdAt"
          )
          .sort({
            createdAt: -1,
          })
          .limit(20);

      res.status(200).json({
        stats: {
          totalUsers,
          totalAuthorities,
          totalReports,
          resolvedReports,
        },

        users,
      });

    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load admin dashboard",
      });
    }
  }
);


// ======================================================
// ADMIN - GET ALL USERS
// ======================================================

app.get(
  "/api/admin/reports",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(
        50,
        Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
      );
      const filter = {};
      const validStatuses = [
        "Reported",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
      ];
      const validCategories = [
        "Road Damage",
        "Garbage",
        "Streetlight",
        "Water Leakage",
        "Drainage",
        "Other",
      ];

      if (req.query.status) {
        if (!validStatuses.includes(req.query.status)) {
          return res.status(400).json({ message: "Invalid status filter." });
        }
        filter.status = req.query.status;
      }

      if (req.query.category) {
        if (!validCategories.includes(req.query.category)) {
          return res.status(400).json({ message: "Invalid category filter." });
        }
        filter.category = req.query.category;
      }

      if (req.query.unassigned === "true") {
        filter.assignedTo = null;
      }

      const priorityRanges = {
        Critical: { $gte: 90 },
        High: { $gte: 70, $lt: 90 },
        Normal: { $gte: 40, $lt: 70 },
        Low: { $lt: 40 },
      };
      if (req.query.priority) {
        const range = priorityRanges[req.query.priority];
        if (!range) {
          return res.status(400).json({ message: "Invalid priority filter." });
        }
        filter.priorityScore = range;
      }

      const search =
        typeof req.query.search === "string"
          ? req.query.search.trim().slice(0, 100)
          : "";
      if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
          { title: { $regex: escapedSearch, $options: "i" } },
          { location: { $regex: escapedSearch, $options: "i" } },
          { category: { $regex: escapedSearch, $options: "i" } },
        ];
      }

      const [reports, total, counts] = await Promise.all([
        Report.find(filter)
          .populate("userId", "name email")
          .populate("assignedTo", "name email role department")
          .populate("assignedBy", "name role")
          .populate("assignmentHistory.assignedTo", "name role department")
          .populate("assignmentHistory.assignedBy", "name role")
          .populate("assignmentHistory.previousAuthority", "name role department")
          .sort({ priorityScore: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Report.countDocuments(filter),
        Promise.all([
          Report.countDocuments(),
          Report.countDocuments({ assignedTo: null }),
          Report.countDocuments({ status: "Reported" }),
          Report.countDocuments({ status: "Assigned" }),
          Report.countDocuments({ status: "In Progress" }),
          Report.countDocuments({ status: "Resolved" }),
          Report.countDocuments({ severity: "Critical", status: { $ne: "Resolved" } }),
        ]).then(([all, unassigned, reported, assigned, inProgress, resolved, critical]) => ({
          total: all,
          unassigned,
          reported,
          assigned,
          inProgress,
          resolved,
          critical,
        })),
      ]);

      return res.status(200).json({
        success: true,
        reports,
        counts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Admin report list error:", error);
      return res.status(500).json({
        message: "Unable to load reports for assignment.",
      });
    }
  }
);

app.get(
  "/api/admin/users",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
      const filter = {};
      const filterClauses = [];
      const validRoles = ["citizen", "authority", "admin"];

      if (req.query.role && req.query.role !== "all") {
        if (!validRoles.includes(req.query.role)) {
          return res.status(400).json({ message: "Invalid role filter." });
        }
        filter.role = req.query.role;
      }

      if (req.query.status === "active") {
        filter.deletedAt = null;
        filterClauses.push({
          $or: [
            { isActive: true },
            { isActive: { $exists: false } },
          ],
        });
      } else if (req.query.status === "suspended") {
        filter.isActive = false;
        filter.deletedAt = null;
      } else if (req.query.status === "removed") {
        filter.deletedAt = { $ne: null };
      } else if (req.query.status && req.query.status !== "all") {
        return res.status(400).json({ message: "Invalid account status filter." });
      }

      const search =
        typeof req.query.search === "string"
          ? req.query.search.trim().slice(0, 100)
          : "";
      if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filterClauses.push({
          $or: [
          { name: { $regex: escapedSearch, $options: "i" } },
          { email: { $regex: escapedSearch, $options: "i" } },
          ],
        });
      }
      if (filterClauses.length) filter.$and = filterClauses;

      const [users, total] = await Promise.all([
        User.find(filter)
          .select("_id name email role authorityStatus department isActive deletedAt deletedBy createdAt")
          .populate("deletedBy", "name role")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      return res.status(200).json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      console.error(
        "Admin users error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch users",
      });
    }
  }
);

app.get(
  "/api/admin/users/:id/impact",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID." });
      }
      const user = await User.findById(req.params.id).select("_id role");
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const [submittedReports, activeAssignedReports] = await Promise.all([
        Report.countDocuments({ userId: user._id }),
        user.role === "authority"
          ? Report.countDocuments({
              assignedTo: user._id,
              status: { $ne: "Resolved" },
            })
          : Promise.resolve(0),
      ]);

      return res.status(200).json({ submittedReports, activeAssignedReports });
    } catch (error) {
      console.error("Account impact lookup error:", error);
      return res.status(500).json({ message: "Unable to check account impact." });
    }
  }
);

app.patch(
  "/api/admin/users/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { isActive } = req.body;
      if (!mongoose.isValidObjectId(req.params.id) || typeof isActive !== "boolean") {
        return res.status(400).json({ message: "A valid user ID and account status are required." });
      }

      const user = await User.findById(req.params.id);
      if (!user || user.deletedAt) {
        return res.status(404).json({ message: "Active account not found." });
      }
      if (user.role === "admin") {
        return res.status(403).json({ message: "Administrator accounts cannot be suspended here." });
      }
      if (user.isActive === isActive) {
        return res.status(200).json({ message: "Account status is unchanged.", user });
      }

      user.isActive = isActive;
      await user.save();
      await AuditLog.create({
        actorId: req.user.id,
        action: isActive ? "USER_REACTIVATED" : "USER_SUSPENDED",
        targetUserId: user._id,
        summary: `${user.role} account ${isActive ? "reactivated" : "suspended"}`,
      });
      await createNotification({
        userId: user._id,
        type: "ACCOUNT_STATUS_CHANGED",
        title: isActive ? "Account reactivated" : "Account suspended",
        message: isActive
          ? "Your CitiZen account has been reactivated."
          : "Your CitiZen account has been suspended. Contact an administrator for help.",
      });

      return res.status(200).json({
        message: `Account ${isActive ? "reactivated" : "suspended"}.`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error("Update account status error:", error);
      return res.status(500).json({ message: "Unable to update account status." });
    }
  }
);

app.post(
  "/api/admin/users/:id/restore",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID." });
      }

      const user = await User.findById(req.params.id);
      if (!user || !user.deletedAt) {
        return res.status(404).json({ message: "Removed account not found." });
      }
      if (user.role === "admin") {
        return res.status(403).json({ message: "Administrator accounts cannot be restored here." });
      }

      const removalRecord = await AuditLog.findOne({
        targetUserId: user._id,
        action: "USER_REMOVED",
      }).sort({ createdAt: -1 });
      const restoredName = removalRecord?.metadata?.originalName;
      const restoredEmail = removalRecord?.metadata?.originalEmail;
      if (!restoredName || !restoredEmail) {
        return res.status(409).json({
          message: "This account does not have restorable identity details.",
        });
      }
      const emailInUse = await User.findOne({
        email: restoredEmail,
        _id: { $ne: user._id },
      });
      if (emailInUse) {
        return res.status(409).json({
          message: "The original email address is now in use by another account.",
        });
      }

      user.name = restoredName;
      user.email = restoredEmail;
      user.isActive = true;
      user.deletedAt = null;
      user.deletedBy = null;
      await user.save();
      await AuditLog.create({
        actorId: req.user.id,
        action: "USER_RESTORED",
        targetUserId: user._id,
        summary: `${user.role} account restored`,
      });

      return res.status(200).json({
        message: "Account restored. The user must reset their password before signing in.",
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      console.error("Restore account error:", error);
      return res.status(500).json({ message: "Unable to restore account." });
    }
  }
);

app.get(
  "/api/admin/audit-logs",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
      const [logs, total] = await Promise.all([
        AuditLog.find()
          .populate("actorId", "name role")
          .populate("targetUserId", "name role")
          .populate("targetReportId", "title")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        AuditLog.countDocuments(),
      ]);

      return res.status(200).json({
        logs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error("Fetch admin audit logs error:", error);
      return res.status(500).json({ message: "Unable to load audit history." });
    }
  }
);

app.patch(
  "/api/admin/authorities/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { authorityStatus } = req.body;

      if (!["approved", "rejected"].includes(authorityStatus)) {
        return res.status(400).json({
          message: "Authority status must be approved or rejected.",
        });
      }

      const authority = await User.findOne({
        _id: req.params.id,
        role: "authority",
      });

      if (!authority) {
        return res.status(404).json({
          message: "Authority account not found.",
        });
      }

      authority.authorityStatus = authorityStatus;
      await authority.save();

      return res.status(200).json({
        message:
          authorityStatus === "approved"
            ? "Authority approved. They can now sign in."
            : "Authority registration rejected.",
        authority: {
          _id: authority._id,
          name: authority.name,
          email: authority.email,
          authorityStatus: authority.authorityStatus,
        },
      });
    } catch (error) {
      console.error("Update authority approval error:", error);
      return res.status(500).json({
        message: "Unable to update authority approval.",
      });
    }
  }
);


// ======================================================
// ADMIN - GET ALL AUTHORITIES
// ======================================================

app.get(
  "/api/admin/authorities",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const authorities =
        await User.find({
          role:
            "authority",
        })
          .select(
            "_id name email role department authorityStatus isActive createdAt"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        authorities,
      });

    } catch (error) {
      console.error(
        "Admin authorities error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch authorities",
      });
    }
  }
);


// ======================================================
// ADMIN - CHANGE USER ROLE
// ======================================================

app.patch(
  "/api/admin/users/:id/role",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        role,
      } = req.body;

      const validRoles = [
        "citizen",
        "authority",
        "admin",
      ];

      if (
        !validRoles.includes(
          role
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid role",
        });
      }

      // Prevent admin from accidentally
      // changing their own role.

      if (
        req.user.id.toString() ===
        req.params.id.toString()
      ) {
        return res.status(400).json({
          message:
            "You cannot change your own role",
        });
      }

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (user.role === "admin" && role !== "admin") {
        const activeAdminCount = await User.countDocuments({
          role: "admin",
          isActive: { $ne: false },
          deletedAt: null,
        });
        if (activeAdminCount <= 1) {
          return res.status(409).json({
            message: "The last active administrator cannot be demoted.",
          });
        }
      }

      const oldRole =
        user.role;

      user.role =
        role;

      await user.save();
      await AuditLog.create({
        actorId: req.user.id,
        action: "USER_ROLE_CHANGED",
        targetUserId: user._id,
        summary: `User role changed from ${oldRole} to ${role}`,
        metadata: { oldRole, role },
      });

      res.status(200).json({
        message:
          "User role updated successfully",

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          oldRole,

          role:
            user.role,
        },
      });

    } catch (error) {
      console.error(
        "Change role error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update user role",
      });
    }
  }
);


// ======================================================
// ADMIN - DELETE USER
// ======================================================

app.delete(
  "/api/admin/users/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid user ID.",
        });
      }

      if (req.user.id.toString() === req.params.id.toString()) {
        return res.status(400).json({ message: "You cannot remove your own account." });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      if (user.role === "admin") {
        return res.status(403).json({ message: "Administrator accounts cannot be removed here." });
      }
      if (user.deletedAt) {
        return res.status(409).json({ message: "This account has already been removed." });
      }
      const originalName = user.name;
      const originalEmail = user.email;

      const activeReports = user.role === "authority"
        ? await Report.find({
            assignedTo: user._id,
            status: { $ne: "Resolved" },
          }).select("_id title status assignedTo assignmentHistory")
        : [];
      const { reassignAuthorityId, leaveUnassigned } = req.body;

      if (reassignAuthorityId && leaveUnassigned === true) {
        return res.status(400).json({
          message: "Choose either a replacement authority or leave reports unassigned, not both.",
        });
      }

      if (activeReports.length > 0 && !reassignAuthorityId && leaveUnassigned !== true) {
        return res.status(409).json({
          code: "ASSIGNMENTS_REQUIRE_DECISION",
          message: "Choose an active approved authority or explicitly leave the assigned reports unassigned.",
          activeAssignmentCount: activeReports.length,
        });
      }

      let replacementAuthority = null;
      if (reassignAuthorityId) {
        if (!mongoose.isValidObjectId(reassignAuthorityId)) {
          return res.status(400).json({ message: "Invalid replacement authority ID." });
        }
        replacementAuthority = await User.findOne({
          _id: reassignAuthorityId,
          role: "authority",
          authorityStatus: "approved",
          isActive: { $ne: false },
          deletedAt: null,
        });
        if (!replacementAuthority || replacementAuthority._id.equals(user._id)) {
          return res.status(400).json({
            message: "Choose a different active, approved authority.",
          });
        }
      }

      const assignmentTime = new Date();
      for (const report of activeReports) {
        const previousStatus = report.status;
        const assignmentAction = replacementAuthority ? "REASSIGNED" : "UNASSIGNED";
        report.assignmentHistory.push({
          assignedTo: replacementAuthority?._id || null,
          assignedBy: req.user.id,
          assignedAt: assignmentTime,
          previousAuthority: user._id,
          action: assignmentAction,
        });
        report.assignedTo = replacementAuthority?._id || null;
        report.assignedAt = replacementAuthority ? assignmentTime : null;
        report.assignedBy = replacementAuthority?._id ? req.user.id : null;
        if (!replacementAuthority) report.status = "Reported";
        await report.save();

        await createActivity({
          reportId: report._id,
          userId: req.user.id,
          action: "ASSIGNED",
          message: replacementAuthority
            ? `Report reassigned to ${replacementAuthority.name} because its previous authority account was removed`
            : "Report was unassigned because its authority account was removed",
          oldValue: user._id.toString(),
          newValue: replacementAuthority?._id.toString() || null,
        });
        await AuditLog.create({
          actorId: req.user.id,
          action: replacementAuthority ? "REPORT_REASSIGNED" : "REPORT_UNASSIGNED",
          targetUserId: user._id,
          targetReportId: report._id,
          summary: replacementAuthority
            ? `Report reassigned before removing authority ${user.name}`
            : `Report unassigned before removing authority ${user.name}`,
          metadata: {
            replacementAuthorityId: replacementAuthority?._id || null,
            previousStatus,
          },
        });

        if (replacementAuthority) {
          await createNotification({
            userId: replacementAuthority._id,
            type: "REPORT_ASSIGNED",
            title: "Report assigned",
            message: `You have been assigned report "${report.title}".`,
            reportId: report._id,
          });
        } else {
          const admins = await User.find({
            role: "admin",
            isActive: { $ne: false },
            deletedAt: null,
          }).select("_id");
          await Promise.all(admins.map((admin) => createNotification({
            userId: admin._id,
            type: "REPORT_UNASSIGNED",
            title: "Report needs reassignment",
            message: `Report "${report.title}" is unassigned after an authority account was removed.`,
            reportId: report._id,
          })));
        }
      }

      user.name = user.role === "authority" ? "Former authority" : "Former citizen";
      user.email = `removed+${user._id}@deleted.citizen.invalid`;
      user.profileImage = null;
      user.password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
      user.isActive = false;
      user.deletedAt = new Date();
      user.deletedBy = req.user.id;
      await user.save();
      await AuditLog.create({
        actorId: req.user.id,
        action: "USER_REMOVED",
        targetUserId: user._id,
        summary: `${user.role} account removed; records retained`,
        metadata: {
          affectedActiveReports: activeReports.length,
          assignmentDisposition: replacementAuthority
            ? "reassigned"
            : activeReports.length
              ? "unassigned"
              : "not_applicable",
          replacementAuthorityId: replacementAuthority?._id || null,
          originalName,
          originalEmail,
        },
      });
      await createNotification({
        userId: user._id,
        type: "ACCOUNT_REMOVED",
        title: "Account removed",
        message: "Your CitiZen account has been removed. Contact an administrator if you believe this was a mistake.",
      });

      return res.status(200).json({
        message: "Account removed. Existing reports and history were retained.",
        affectedActiveReports: activeReports.length,
        assignmentDisposition: replacementAuthority
          ? "reassigned"
          : activeReports.length
            ? "unassigned"
            : "not_applicable",
      });

    } catch (error) {
      console.error("Remove account error:", error);
      return res.status(500).json({ message: "Failed to remove account." });
    }
  }
);


// ======================================================
// 404 HANDLER
// ======================================================

app.use(
  (req, res) => {
    res.status(404).json({
      message:
        "API route not found",
    });
  }
);


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error",
    });
  }
);


// ======================================================
// DATABASE + SERVER
// ======================================================

const PORT =
  process.env.PORT || 5000;

// Supports either variable name.

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error(
    "❌ MongoDB connection string is missing."
  );

  console.error(
    "Add MONGO_URI or MONGODB_URI to your .env file."
  );

  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error(
    "❌ JWT_SECRET is missing from .env"
  );

  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      "✅ MongoDB connected"
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `🚀 Server running on http://localhost:${PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "❌ MongoDB connection failed:"
    );

    console.error(
      error.message
    );
  });