const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");

const Report = require("./models/Report");
const User = require("./models/User");
const Comment = require("./models/Comment");
const Notification = require("./models/Notification");
const ReportActivity = require("./models/ReportActivity");

const protect = require("./middleware/authMiddleware");
const authorityOnly = require("./middleware/authorityMiddleware");
const adminOnly = require("./middleware/adminMiddleware");

require("dotenv").config();


// ======================================================
// APP
// ======================================================

const app = express();


// ======================================================
// BASIC MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());


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
    console.error("❌ Email transporter error:");
    console.error(error.message);
  } else {
    console.log("✅ Email transporter is ready");
  }
});


// ======================================================
// CIVIC INTELLIGENCE
// ======================================================

function calculatePriorityScore(category, severity) {
  let score = 50;

  // Category importance

  if (category === "Road Damage") {
    score += 10;
  }

  if (category === "Water Leakage") {
    score += 15;
  }

  if (category === "Drainage") {
    score += 15;
  }

  if (category === "Streetlight") {
    score += 5;
  }

  if (category === "Garbage") {
    score += 5;
  }

  // Severity

  if (severity === "Low") {
    score -= 15;
  }

  if (severity === "Medium") {
    score += 0;
  }

  if (severity === "High") {
    score += 20;
  }

  if (severity === "Critical") {
    score += 35;
  }

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
    console.error(
      "Notification error:",
      error.message
    );
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
    console.error(
      "Activity error:",
      error.message
    );
  }
}


// ======================================================
// NEARBY REPORTS / DUPLICATE DETECTION
// ======================================================

async function findNearbyReports(
  latitude,
  longitude
) {
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
    .sort({
      createdAt: -1,
    })
    .limit(20);
}


// ======================================================
// MULTER IMAGE UPLOAD
// ======================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
});


// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "CitiZen API is running",
  });
});


// ==========================================
// ADMIN - CREATE AUTHORITY
// ==========================================

app.post("/api/admin/authorities", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
    });

    res.status(201).json({
      message: "Authority created successfully",
      authority: {
        _id: authority._id,
        name: authority.name,
        email: authority.email,
        role: authority.role,
      },
    });
  } catch (error) {
    console.error("Create authority error:", error);

    res.status(500).json({
      message: "Failed to create authority",
    });
  }
});

// ======================================================
// AUTH - REGISTER
// ======================================================

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Name, email and password are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "User already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
        });

      res.status(201).json({
        message:
          "User registered successfully",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    } catch (error) {
      console.error(
        "Registration error:",
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
// AUTH - LOGIN
// ======================================================

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Email and password are required",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const isPasswordCorrect =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isPasswordCorrect) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const token =
        jwt.sign(
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

      res.status(200).json({
        message:
          "Login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    } catch (error) {
      console.error(
        "Login error:",
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
// AUTH - FORGOT PASSWORD
// ======================================================

app.post(
  "/api/auth/forgot-password",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message:
            "Please enter your email address.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      // Don't reveal whether an account exists

      if (!user) {
        return res.status(200).json({
          message:
            "If an account exists with this email, a password reset link has been sent.",
        });
      }

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
  upload.single("image"),
  async (req, res) => {
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

          latitude:
            numericLatitude,

          longitude:
            numericLongitude,

          imageUrl:
            req.file
              ? `/uploads/${req.file.filename}`
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
            "name email"
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
        return res.status(400).json({
          message:
            "You already appreciated this report",
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
  authorityOnly,
  async (req, res) => {
    try {
      const {
        authorityId,
      } = req.body;

      if (!authorityId) {
        return res.status(400).json({
          message:
            "Authority ID is required",
        });
      }

      const authority =
        await User.findById(
          authorityId
        );

      if (!authority) {
        return res.status(404).json({
          message:
            "Authority not found",
        });
      }

      if (
        authority.role !==
          "authority" &&
        authority.role !==
          "admin"
      ) {
        return res.status(400).json({
          message:
            "User is not an authority",
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
        message:
          "Report assigned successfully",

        report,
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
      const reports =
        await Report.find({
          assignedTo:
            req.user.id,
        })
          .populate(
            "userId",
            "name email"
          )
          .populate(
            "assignedTo",
            "name email role"
          )
          .sort({
            priorityScore: -1,

            createdAt: -1,
          });

      res.status(200).json({
        reports,
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
            "name email"
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
            "_id name email role createdAt"
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
  "/api/admin/users",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const users =
        await User.find()
          .select(
            "_id name email role createdAt"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        users,
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
            "_id name email role createdAt"
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

      const oldRole =
        user.role;

      user.role =
        role;

      await user.save();

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
      if (
        req.user.id.toString() ===
        req.params.id.toString()
      ) {
        return res.status(400).json({
          message:
            "You cannot delete your own account",
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

      await User.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message:
          "User deleted successfully",
      });

    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete user",
      });
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