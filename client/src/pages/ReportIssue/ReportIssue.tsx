import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";

interface Coordinates {
  latitude: number;
  longitude: number;
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

  const [address, setAddress] = useState("");
  const [locationLoading, setLocationLoading] =
    useState(true);
  const [locationConfirmed, setLocationConfirmed] =
    useState(false);

  const [image, setImage] =
    useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError(
        "Geolocation is not supported by your browser."
      );
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        try {
          // Reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );

          const data = await response.json();

          setAddress(
            data.display_name ||
              `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          );
        } catch (error) {
          console.error(error);

          setAddress(
            `${lat.toFixed(5)}, ${lng.toFixed(5)}`
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

    if (!title || !description || !category) {
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

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append(
        "description",
        description
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

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        "http://localhost:5000/api/reports",
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
      setImage(null);

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

        <div className="mt-10 space-y-6">

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

                    <ChangeMapView
                      latitude={latitude}
                      longitude={longitude}
                    />

                  </MapContainer>
                )}

              <div className="p-5">

                <p className="text-gray-300">
                  {address ||
                    "Address unavailable"}
                </p>

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
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full mt-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
            />

          </div>

          {/* IMAGE */}

          <div>

            <label className="text-sm text-gray-300">
              Evidence Image
            </label>

            <input
              id="report-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file =
                  e.target.files?.[0] || null;

                setImage(file);
              }}
              className="w-full mt-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-gray-300"
            />

            {image && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {image.name}
              </p>
            )}

          </div>

          {/* SUBMIT */}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!locationConfirmed}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition"
          >
            Submit Report
          </button>

        </div>

      </main>

    </div>
  );
}

export default ReportIssue;