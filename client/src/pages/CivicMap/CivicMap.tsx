import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

interface Report {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;

  latitude?: number | null;
  longitude?: number | null;

  imageUrl?: string | null;

  status?: string;

  severity?: string;

  priorityScore?: number;

  appreciationCount?: number;

  commentCount?: number;

  createdAt?: string;
}


// ================= CATEGORIES =================

const categories = [
  "All",
  "Road Damage",
  "Garbage",
  "Streetlight",
  "Water Leakage",
  "Drainage",
  "Other",
];


// ================= STATUSES =================

const statuses = [
  "All",
  "Reported",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
];


// ================= MARKER COLOR =================

function getMarkerColor(status?: string) {
  switch (status) {
    case "Reported":
      return "#ef4444";

    case "Under Review":
      return "#eab308";

    case "Assigned":
      return "#a855f7";

    case "In Progress":
      return "#3b82f6";

    case "Resolved":
      return "#22c55e";

    default:
      return "#64748b";
  }
}


// ================= VALID COORDINATES =================

function hasValidCoordinates(
  report: Report
) {
  return (
    typeof report.latitude === "number" &&
    typeof report.longitude === "number" &&
    Number.isFinite(report.latitude) &&
    Number.isFinite(report.longitude) &&
    report.latitude >= -90 &&
    report.latitude <= 90 &&
    report.longitude >= -180 &&
    report.longitude <= 180
  );
}


// ================= CIVIC MAP =================

function CivicMap() {
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [search, setSearch] =
    useState("");


  // ================= FETCH REPORTS =================

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/reports"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch reports"
          );
        }

        const data =
          await response.json();

        const fetchedReports =
          Array.isArray(data.reports)
            ? data.reports
            : [];

        console.log(
          "All reports:",
          fetchedReports
        );


        // Only keep reports that have
        // valid latitude and longitude.

        const validReports =
          fetchedReports.filter(
            (report: Report) =>
              hasValidCoordinates(report)
          );


        console.log(
          "Valid map reports:",
          validReports
        );


        console.log(
          "Ignored reports:",
          fetchedReports.length -
            validReports.length
        );


        setReports(validReports);

      } catch (error) {
        console.error(
          "Civic Map Error:",
          error
        );

        setError(
          "Unable to load civic reports."
        );

      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);


  // ================= FILTER REPORTS =================

  const filteredReports =
    useMemo(() => {
      return reports.filter(
        (report) => {

          // CATEGORY

          const matchesCategory =
            categoryFilter === "All" ||
            report.category ===
              categoryFilter;


          // STATUS

          const matchesStatus =
            statusFilter === "All" ||
            report.status ===
              statusFilter;


          // SEARCH

          const searchText =
            search
              .trim()
              .toLowerCase();


          const matchesSearch =
            !searchText ||
            report.title
              .toLowerCase()
              .includes(searchText) ||

            report.description
              .toLowerCase()
              .includes(searchText) ||

            report.location
              .toLowerCase()
              .includes(searchText) ||

            report.category
              .toLowerCase()
              .includes(searchText);


          return (
            matchesCategory &&
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      reports,
      categoryFilter,
      statusFilter,
      search,
    ]);


  // ================= MAP CENTER =================

  const center: [number, number] =
    filteredReports.length > 0 &&
    hasValidCoordinates(
      filteredReports[0]
    )
      ? [
          filteredReports[0].latitude!,
          filteredReports[0].longitude!,
        ]
      : [12.9716, 77.5946];


  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-5">
            🗺️
          </div>

          <h1 className="text-2xl font-bold">
            Loading Civic Map...
          </h1>

          <p className="text-gray-400 mt-2">
            Fetching reported civic issues.
          </p>

        </div>

      </div>
    );
  }


  // ================= ERROR =================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-xl font-bold text-red-400">
            Civic Map Error
          </h1>

          <p className="text-gray-400 mt-3">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // ================= PAGE =================

  return (
    <div className="min-h-screen bg-slate-950 text-white">


      {/* ================= HEADER ================= */}

      <header className="border-b border-white/10 px-8 py-6">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold">
            Civic Intelligence Map 🗺️
          </h1>

          <p className="text-gray-400 mt-2">
            Explore civic issues reported across
            the community.
          </p>

        </div>

      </header>


      {/* ================= FILTERS ================= */}

      <section className="max-w-7xl mx-auto px-6 py-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
          />


          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
          >

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}

          </select>


          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
          >

            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}

          </select>

        </div>


        {/* REPORT COUNT */}

        <div className="mt-4 text-sm text-gray-400">

          Showing{" "}

          <span className="text-white font-semibold">
            {filteredReports.length}
          </span>

          {" "}of{" "}

          <span className="text-white font-semibold">
            {reports.length}
          </span>

          {" "}reports

        </div>

      </section>


      {/* ================= MAIN ================= */}

      <main className="max-w-7xl mx-auto px-6 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          {/* ================= MAP ================= */}

          <div className="lg:col-span-2">

            <div className="rounded-2xl overflow-hidden border border-white/10">

              <MapContainer
                center={center}
                zoom={13}
                className="h-[650px] w-full"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {/* ================= MARKERS ================= */}

                {filteredReports.map(
                  (report) => {

                    // Extra safety check.
                    // A bad report can NEVER
                    // crash Leaflet.

                    if (
                      !hasValidCoordinates(
                        report
                      )
                    ) {
                      return null;
                    }


                    return (
                      <CircleMarker
                        key={report._id}
                        center={[
                          report.latitude!,
                          report.longitude!,
                        ]}
                        radius={9}
                        pathOptions={{
                          color:
                            getMarkerColor(
                              report.status
                            ),

                          fillColor:
                            getMarkerColor(
                              report.status
                            ),

                          fillOpacity: 0.8,
                        }}
                      >

                        <Popup>

                          <div className="min-w-[250px] text-black">


                            {/* TITLE */}

                            <h3 className="font-bold text-lg">
                              {report.title}
                            </h3>


                            {/* DESCRIPTION */}

                            <p className="text-sm mt-2 text-gray-600">
                              {report.description}
                            </p>


                            {/* DETAILS */}

                            <div className="mt-3 space-y-2 text-sm">

                              <p>
                                <strong>
                                  Category:
                                </strong>{" "}
                                {report.category}
                              </p>


                              <p>
                                <strong>
                                  Status:
                                </strong>{" "}
                                {report.status ||
                                  "Reported"}
                              </p>


                              <p>
                                <strong>
                                  Severity:
                                </strong>{" "}
                                {report.severity ||
                                  "Not assessed"}
                              </p>


                              <p>
                                <strong>
                                  Priority:
                                </strong>{" "}
                                {typeof report.priorityScore ===
                                "number"
                                  ? report.priorityScore
                                  : "Not calculated"}
                              </p>


                              <p>
                                <strong>
                                  Appreciations:
                                </strong>{" "}
                                {report.appreciationCount ??
                                  0}
                              </p>


                              <p>
                                <strong>
                                  Comments:
                                </strong>{" "}
                                {report.commentCount ??
                                  0}
                              </p>

                            </div>


                            {/* LOCATION */}

                            <p className="text-xs text-gray-500 mt-4">
                              📍 {report.location}
                            </p>


                            {/* COORDINATES */}

                            <p className="text-xs text-gray-400 mt-2">
                              {report.latitude!.toFixed(
                                6
                              )}
                              ,{" "}
                              {report.longitude!.toFixed(
                                6
                              )}
                            </p>


                          </div>

                        </Popup>

                      </CircleMarker>
                    );
                  }
                )}

              </MapContainer>

            </div>


            {/* NO MAP REPORTS */}

            {filteredReports.length === 0 && (

              <div className="mt-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5 text-center text-yellow-400">

                🔍 No reports match your
                current filters.

              </div>

            )}

          </div>


          {/* ================= REPORT LIST ================= */}

          <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2">


            {filteredReports.length === 0 ? (

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 text-center">

                <div className="text-4xl mb-3">
                  🔍
                </div>

                <p className="text-gray-400">
                  No reports match your filters.
                </p>

              </div>

            ) : (

              filteredReports.map(
                (report) => (

                  <div
                    key={report._id}
                    className="bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-blue-500/40 transition"
                  >


                    {/* TITLE + STATUS */}

                    <div className="flex justify-between gap-3">

                      <h2 className="font-bold text-lg">
                        {report.title}
                      </h2>


                      <span
                        className="text-xs px-2 py-1 rounded-full h-fit whitespace-nowrap"
                        style={{
                          backgroundColor:
                            `${getMarkerColor(
                              report.status
                            )}22`,

                          color:
                            getMarkerColor(
                              report.status
                            ),
                        }}
                      >
                        {report.status ||
                          "Reported"}
                      </span>

                    </div>


                    {/* DESCRIPTION */}

                    <p className="text-gray-400 text-sm mt-2">
                      {report.description}
                    </p>


                    {/* DETAILS */}

                    <div className="mt-4 text-sm space-y-2">

                      <p>
                        📂{" "}
                        {report.category}
                      </p>


                      <p>
                        ⚠️{" "}
                        {report.severity ||
                          "Not assessed"}
                      </p>


                      <p>
                        📍{" "}
                        {report.location}
                      </p>


                      <p className="text-gray-500">
                        Priority Score:{" "}
                        {typeof report.priorityScore ===
                        "number"
                          ? report.priorityScore
                          : "Not calculated"}
                      </p>


                      <p className="text-gray-500">
                        ❤️ Appreciations:{" "}
                        {report.appreciationCount ??
                          0}
                      </p>


                      <p className="text-gray-500">
                        💬 Comments:{" "}
                        {report.commentCount ??
                          0}
                      </p>

                    </div>


                    {/* IMAGE */}

                    {report.imageUrl && (

                      <img
                        src={`http://localhost:5000${report.imageUrl}`}
                        alt={report.title}
                        className="w-full h-40 object-cover rounded-xl mt-4"
                      />

                    )}

                  </div>

                )
              )

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default CivicMap;