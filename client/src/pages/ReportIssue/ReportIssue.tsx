import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { apiUrl } from "../../lib/api";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface SimilarReport {
  id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  distanceMeters: number;
  similarity: number;
  explanation: string;
}

interface CategorySuggestion {
  category: string;
  reason: string;
}

function MapLocationPicker({
  onSelect,
}: {
  onSelect: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function ChangeMapView({
  latitude,
  longitude,
}: Coordinates) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 16);
  }, [latitude, longitude, map]);

  return null;
}

function getCategorySuggestion(
  description: string
): CategorySuggestion | null {
  const rules: {
    category: string;
    pattern: RegExp;
    reason: string;
  }[] = [
    {
      category: "Water Leakage",
      pattern: /\b(leak|leaking|burst pipe|water pipe|water flowing)\b/i,
      reason: "mentions leaking or flowing water",
    },
    {
      category: "Drainage",
      pattern: /\b(drain|drainage|sewer|blocked manhole|overflowing manhole)\b/i,
      reason: "mentions a drain, sewer, or manhole",
    },
    {
      category: "Streetlight",
      pattern: /\b(street ?light|lamp ?post|light pole|street lamp)\b/i,
      reason: "mentions a streetlight or lamp post",
    },
    {
      category: "Garbage",
      pattern: /\b(garbage|rubbish|trash|litter|waste|dump)\b/i,
      reason: "mentions garbage, litter, or waste",
    },
    {
      category: "Road Damage",
      pattern: /\b(pothole|road damage|pavement|road crack|damaged road)\b/i,
      reason: "mentions road or pavement damage",
    },
  ];

  return (
    rules.find(({ pattern }) => pattern.test(description)) ?? null
  );
}

function getSeveritySuggestion(description: string) {
  if (
    /\b(life.?threatening|injur(y|ies)|accident|fire|exposed wire|electrocution|collapse)\b/i.test(
      description
    )
  ) {
    return {
      severity: "Critical",
      reason: "the description mentions an immediate safety risk",
    };
  }

  if (
    /\b(flood(ing)?|blocked road|major|severe|dangerous|overflow(ing)?)\b/i.test(
      description
    )
  ) {
    return {
      severity: "High",
      reason: "the description suggests significant impact or obstruction",
    };
  }

  if (/\b(minor|small|slight|occasional)\b/i.test(description)) {
    return {
      severity: "Low",
      reason: "the description indicates a limited or occasional issue",
    };
  }

  return null;
}

async function lookupAddress(latitude: number, longitude: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );

  if (!response.ok) {
    throw new Error("Address lookup is temporarily unavailable.");
  }

  const data: { display_name?: string } = await response.json();
  return data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function ReportIssue() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("Medium");

  const [latitude, setLatitude] =
    useState<number | null>(null);
  const [longitude, setLongitude] =
    useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] =
    useState<number | null>(null);

  const [address, setAddress] = useState("");
  const [locationLoading, setLocationLoading] = useState(
    () => Boolean(navigator.geolocation)
  );
  const [locationConfirmed, setLocationConfirmed] =
    useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imagePreviewUrls = useRef<string[]>([]);

  const [error, setError] = useState(
    () =>
      navigator.geolocation
        ? ""
        : "Geolocation is not supported by your browser."
  );
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [similarReports, setSimilarReports] =
    useState<SimilarReport[]>([]);
  const [similarLoading, setSimilarLoading] =
    useState(false);
  const [similarError, setSimilarError] = useState("");

  const categorySuggestion = useMemo(
    () => getCategorySuggestion(description),
    [description]
  );
  const severitySuggestion = useMemo(
    () => getSeveritySuggestion(description),
    [description]
  );
  const hasSimilarLookupInput =
    latitude !== null &&
    longitude !== null &&
    (Boolean(category) || description.trim().length >= 8);

  useEffect(
    () => () => {
      imagePreviewUrls.current.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    },
    []
  );

  useEffect(() => {
    if (
      latitude === null ||
      longitude === null ||
      (!category && description.trim().length < 8)
    ) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSimilarLoading(true);
      setSimilarError("");

      try {
        const query = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          category,
          description: description.trim().slice(0, 500),
        });
        const response = await fetch(
          apiUrl(`/api/reports/similar?${query}`),
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to check for similar reports."
          );
        }

        setSimilarReports(data.suggestions || []);
      } catch (lookupError) {
        if (
          lookupError instanceof DOMException &&
          lookupError.name === "AbortError"
        ) {
          return;
        }

        console.error("Similar report lookup failed:", lookupError);
        setSimilarError(
          lookupError instanceof Error
            ? lookupError.message
            : "Unable to check for similar reports."
        );
      } finally {
        if (!controller.signal.aborted) {
          setSimilarLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [latitude, longitude, category, description]);

  // --------------------------------
  // CHECK LOGIN FIRST
  // THEN GET CURRENT LOCATION
  // --------------------------------

  useEffect(() => {
    const token = localStorage.getItem("token");

    // User is not logged in
    if (!token) {
      navigate("/login", {
        state: {
          from: "/report",
        },
        replace: true,
      });

      return;
    }

    // User is logged in → now detect location
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);
        setGpsAccuracy(position.coords.accuracy);

        try {
          setAddress(await lookupAddress(lat, lng));
        } catch (error) {
          console.error("Initial address lookup failed:", error);
          setAddress(
            `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          );
          setError(
            "Address lookup is unavailable. Review the coordinates and confirm your location."
          );
        }

        setLocationLoading(false);
      },

      (error) => {
        console.error(error);

        setLocationLoading(false);

        if (error.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setError(
            "Unable to determine your current location."
          );
        } else {
          setError(
            "Unable to get your current location."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [navigate]);

  // --------------------------------
  // CONFIRM LOCATION
  // --------------------------------

  async function selectMapLocation(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
    setGpsAccuracy(null);
    setLocationConfirmed(false);
    setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    setError("");

    try {
      setAddress(await lookupAddress(lat, lng));
    } catch (lookupError) {
      console.error("Manual address lookup failed:", lookupError);
      setError(
        "Address lookup is unavailable. You can still confirm this map pin using its coordinates."
      );
    }
  }

  function selectImages(files: File[]) {
    imagePreviewUrls.current.forEach((url) =>
      URL.revokeObjectURL(url)
    );
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    imagePreviewUrls.current = previewUrls;
    setImages(files);
    setImagePreviews(previewUrls);
  }

  function confirmLocation() {
    if (
      latitude === null ||
      longitude === null
    ) {
      setError(
        "Location is not available yet."
      );
      return;
    }

    setLocationConfirmed(true);
    setError("");
  }

  // --------------------------------
  // SUBMIT REPORT
  // --------------------------------

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim() || !category) {
      setError("Please fill in all fields.");
      return;
    }

    if (
      latitude === null ||
      longitude === null ||
      !address
    ) {
      setError(
        "Your location could not be detected."
      );
      return;
    }

    if (!locationConfirmed) {
      setError(
        "Please confirm your location first."
      );
      return;
    }

    // Double-check authentication
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: "/report",
        },
        replace: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append(
        "description",
        description.trim()
      );
      formData.append("category", category);
      formData.append("location", address);
      formData.append("severity", severity);

      formData.append(
        "latitude",
        latitude.toString()
      );

      formData.append(
        "longitude",
        longitude.toString()
      );

      images.forEach((file) => formData.append("image", file));

      const response = await fetch(
        apiUrl("/api/reports"),
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create report."
        );
        return;
      }

      setSuccess(
        "Report submitted successfully! 🎉"
      );

      setTitle("");
      setDescription("");
      setCategory("");
      setSeverity("Medium");
      selectImages([]);

      setLocationConfirmed(false);

      const fileInput =
        document.getElementById(
          "report-image"
        ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // --------------------------------
  // LOADING LOCATION
  // --------------------------------

  if (locationLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">

          <div className="text-5xl mb-5">
            📍
          </div>

          <h1 className="text-2xl font-bold">
            Detecting your location...
          </h1>

          <p className="text-gray-400 mt-3">
            Please allow location access when your
            browser asks.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-white/10 px-8 py-5 flex items-center justify-between">

        <Link
          to="/dashboard"
          className="text-2xl font-bold text-blue-500"
        >
          🏙 CitiZen
        </Link>

        <Link
          to="/dashboard"
          className="text-gray-400 hover:text-white"
        >
          ← Dashboard
        </Link>

      </nav>

      {/* FORM */}

      <main className="max-w-3xl mx-auto px-6 py-16">

        <h1 className="text-4xl font-bold">
          Report a Civic Issue
        </h1>

        <p className="text-gray-400 mt-3">
          Help improve your city by reporting a problem.
        </p>

        {/* ERROR */}

        {error && (
          <div className="mt-8 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mt-8 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        <div id="report-form" className="mt-10 space-y-6">

          {/* TITLE */}

          <div>

            <label className="text-sm text-gray-300">
              Issue Title
            </label>

            <input
              type="text"
              placeholder="Example: Large pothole near main road"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full mt-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* CATEGORY */}

          <div>

            <label className="text-sm text-gray-300">
              Category
            </label>

            <select
              id="report-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full mt-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            >

              <option value="">
                Select a category
              </option>

              <option value="Road Damage">
                Road Damage
              </option>

              <option value="Garbage">
                Garbage
              </option>

              <option value="Streetlight">
                Streetlight
              </option>

              <option value="Water Leakage">
                Water Leakage
              </option>

              <option value="Drainage">
                Drainage
              </option>

              <option value="Other">
                Other
              </option>

            </select>

            {categorySuggestion && (
              <div className="mt-3 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-4">
                <p className="text-sm font-medium text-cyan-100">
                  Rule-based suggestion: {categorySuggestion.category}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Suggested because the description {categorySuggestion.reason}.
                  This is a keyword rule, not an AI prediction.
                </p>
                {category !== categorySuggestion.category && (
                  <button
                    type="button"
                    onClick={() => setCategory(categorySuggestion.category)}
                    className="mt-3 rounded-lg border border-cyan-200/20 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-200/10"
                  >
                    Use suggested category
                  </button>
                )}
              </div>
            )}

          </div>

          {/* SEVERITY */}

          <div>

            <label className="text-sm text-gray-300">
              Severity
            </label>

            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value)
              }
              className="w-full mt-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            >

              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>

              <option value="Critical">
                Critical
              </option>

            </select>

            {severitySuggestion && (
              <div className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/5 p-4">
                <p className="text-sm font-medium text-amber-100">
                  Consider {severitySuggestion.severity} severity
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {severitySuggestion.reason}. This is a rule-based prompt; choose
                  the severity that best reflects the situation.
                </p>
                {severity !== severitySuggestion.severity && (
                  <button
                    type="button"
                    onClick={() => setSeverity(severitySuggestion.severity)}
                    className="mt-3 rounded-lg border border-amber-200/20 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-200/10"
                  >
                    Use suggestion
                  </button>
                )}
              </div>
            )}

          </div>

          {/* CURRENT LOCATION */}

          <div>

            <label className="text-sm text-gray-300">
              📍 Current Location
            </label>

            <div className="mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden">

              {latitude !== null &&
                longitude !== null && (
                  <MapContainer
                    center={[
                      latitude,
                      longitude,
                    ]}
                    zoom={16}
                    className="h-72 w-full"
                  >

                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker
                      position={[
                        latitude,
                        longitude,
                      ]}
                    />

                    <MapLocationPicker
                      onSelect={(lat, lng) => {
                        void selectMapLocation(lat, lng);
                      }}
                    />

                    <ChangeMapView
                      latitude={latitude}
                      longitude={longitude}
                    />

                  </MapContainer>
                )}

              <div className="p-5">

                <p className="mb-2 text-xs text-cyan-200">
                  Click the map to move the pin to the exact issue location.
                </p>

                <p className="text-gray-300">
                  {address ||
                    "Address unavailable"}
                </p>

                {gpsAccuracy !== null && (
                  <p className="mt-2 text-sm text-gray-400">
                    GPS accuracy: approximately{" "}
                    {Math.round(gpsAccuracy)} m
                    {gpsAccuracy <= 50
                      ? " (good)"
                      : " (consider adjusting the pin)"}
                  </p>
                )}

                {gpsAccuracy === null &&
                  latitude !== null &&
                  longitude !== null && (
                    <p className="mt-2 text-sm text-gray-400">
                      Manually selected map pin
                    </p>
                  )}

                {latitude !== null &&
                  longitude !== null && (
                    <p className="text-sm text-gray-500 mt-2">
                      Coordinates:{" "}
                      {latitude.toFixed(6)},{" "}
                      {longitude.toFixed(6)}
                    </p>
                  )}

              </div>

            </div>

            {/* CONFIRM */}

            {!locationConfirmed ? (
              <button
                type="button"
                onClick={confirmLocation}
                disabled={
                  latitude === null ||
                  longitude === null
                }
                className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition"
              >
                ✓ Confirm This Location
              </button>
            ) : (
              <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-center">
                ✓ Location confirmed
              </div>
            )}

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="text-sm text-gray-300">
              Description
            </label>

            <textarea
              rows={5}
              maxLength={2000}
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full mt-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
            />

            <p className="mt-1 text-right text-xs text-slate-500">
              {description.length}/2000
            </p>

          </div>

          {/* IMAGE */}

          <div>

            <label className="text-sm text-gray-300">
              Evidence Image
            </label>

            <input
              id="report-image"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                if (!files.length) {
                  return;
                }

                if (files.length > 5) {
                  setError("Choose no more than 5 images.");
                  e.currentTarget.value = "";
                  return;
                }

                if (
                  files.some(
                    (file) =>
                      !["image/jpeg", "image/png", "image/webp"].includes(
                        file.type
                      )
                  )
                ) {
                  setError("Choose JPEG, PNG, or WebP images only.");
                  e.currentTarget.value = "";
                  return;
                }

                if (files.some((file) => file.size > 5 * 1024 * 1024)) {
                  setError("Each image must be 5 MB or smaller.");
                  e.currentTarget.value = "";
                  return;
                }

                if (
                  files.reduce((total, file) => total + file.size, 0) >
                  20 * 1024 * 1024
                ) {
                  setError("The total image size must be 20 MB or smaller.");
                  e.currentTarget.value = "";
                  return;
                }

                setError("");
                selectImages(files);
              }}
              className="w-full mt-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-gray-300"
            />

            {images.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${image.lastModified}-${index}`}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <img
                      src={imagePreviews[index]}
                      alt={`Preview of ${image.name}`}
                      className="h-48 w-full rounded-lg object-contain"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="truncate text-sm text-gray-300">
                        {image.name}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          selectImages(
                            images.filter((_, imageIndex) => imageIndex !== index)
                          )
                        }
                        className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-red-300/30 hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* SIMILAR REPORTS */}

          <section
            aria-live="polite"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
          >
            <h2 className="font-semibold">Nearby similar reports</h2>
            <p className="mt-1 text-sm text-slate-400">
              Suggestions use location, category, and shared description terms.
              They do not prevent you from reporting a separate issue.
            </p>

            {hasSimilarLookupInput && similarLoading && (
              <p className="mt-4 text-sm text-cyan-200">
                Checking for nearby reports…
              </p>
            )}

            {hasSimilarLookupInput && similarError && (
              <p role="status" className="mt-4 text-sm text-amber-200">
                Similarity lookup unavailable: {similarError}
              </p>
            )}

            {hasSimilarLookupInput &&
              !similarLoading &&
              !similarError &&
              similarReports.length > 0 && (
                <div className="mt-4 space-y-3">
                  {similarReports.map((report) => (
                    <Link
                      key={report.id}
                      to={`/reports/${report.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-cyan-200/25"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-slate-100">
                          {report.title}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                          {report.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {report.category} · {report.distanceMeters} m away ·{" "}
                        {report.explanation}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            {hasSimilarLookupInput &&
              !similarLoading &&
              !similarError &&
              similarReports.length === 0 && (
                <p className="mt-4 text-sm text-slate-400">
                  No similar reports found nearby so far.
                </p>
              )}
          </section>

          {/* SUBMIT */}

          <div>
            {submitting && (
              <div
                className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Submitting report"
              >
                <div className="h-full w-1/3 animate-pulse rounded-full bg-cyan-300 motion-reduce:animate-none" />
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!locationConfirmed || submitting}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              {submitting ? "Submitting report…" : "Review and submit report"}
            </button>
          </div>

        </div>

        <section
          aria-labelledby="reporting-questions-title"
          className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_70px_rgba(2,8,23,0.28)] sm:p-9"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Before you submit
            </p>
            <h2
              id="reporting-questions-title"
              className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Questions about reporting an issue?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              What CitiZen does, what it doesn’t, and how to make your report
              useful to the people who review it.
            </p>

            <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-100 marker:hidden">
                  Is CitiZen for emergencies?
                  <span
                    aria-hidden="true"
                    className="text-xl text-cyan-200 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-slate-400">
                  No. CitiZen is for reporting and tracking civic issues; it
                  is not monitored as an emergency service. If anyone is in
                  immediate danger, contact your local emergency services.
                </p>
              </details>

              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-100 marker:hidden">
                  What happens after I submit?
                  <span aria-hidden="true" className="text-xl text-cyan-200 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-slate-400">
                  Your report is saved in CitiZen and can be reviewed and
                  updated by the relevant city team. Check My Reports for its
                  status; submission does not guarantee a response time or a
                  particular outcome.
                </p>
              </details>

              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-100 marker:hidden">
                  How can I make sure the location is right?
                  <span aria-hidden="true" className="text-xl text-cyan-200 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-slate-400">
                  Your device’s location is only a starting point. Check the
                  address and coordinates, move the map pin to the issue, then
                  confirm the location before submitting.
                </p>
              </details>

              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-100 marker:hidden">
                  What if I choose the wrong category or severity?
                  <span aria-hidden="true" className="text-xl text-cyan-200 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-slate-400">
                  CitiZen may suggest a category or severity from the words in
                  your description. These are only suggestions, not an
                  official assessment—review them and choose the closest fit.
                </p>
              </details>

              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-100 marker:hidden">
                  What if someone has already reported it?
                  <span aria-hidden="true" className="text-xl text-cyan-200 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-slate-400">
                  Nearby similar reports are shown as a helpful check, not a
                  blocker. If yours describes a separate issue or adds useful
                  details, you can still submit it.
                </p>
              </details>

              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-100 marker:hidden">
                  Should I add a photo?
                  <span aria-hidden="true" className="text-xl text-cyan-200 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-slate-400">
                  Photos are optional. You can attach up to five JPEG, PNG, or
                  WebP images (5 MB each). Show the issue clearly, and avoid
                  including private or identifying details when they aren’t
                  needed.
                </p>
              </details>

              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-100 marker:hidden">
                  Can I report anonymously? What happens to my details?
                  <span aria-hidden="true" className="text-xl text-cyan-200 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-slate-400">
                  Not currently: you need to sign in, and the report is linked
                  to your account. Report detail pages can display the
                  reporter’s name and email, so don’t include sensitive
                  personal information in the report or photos.
                </p>
              </details>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                Your neighborhood is worth paying attention to. A clear
                location and a few useful details help make the issue visible.
              </p>
              <a
                href="#report-form"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-200/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-200/15"
              >
                Back to your report
              </a>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}

export default ReportIssue;