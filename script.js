// ---- Editable bits (no need to touch HTML) ----
const EVENT = {
  title: "Mordi Pier to Pub",
  dateISO: "2026-02-28",           // YYYY-MM-DD
  timezone: "Australia/Melbourne", // for clarity (calendar uses UTC below)
  // If you decide an exact start time later, change these:
  startTimeLocal: "09:00", // HH:MM
  durationMinutes: 180,    // total block length
  startQuery: "Mordialloc Pier",
  pubQuery: "Bridge Hotel Mordialloc"
};

// ---- Map + links ----
function q(s){ return encodeURIComponent(s); }

const startMapsUrl = `https://www.google.com/maps/search/?api=1&query=${q(EVENT.startQuery)}`;
const pubMapsUrl   = `https://www.google.com/maps/search/?api=1&query=${q(EVENT.pubQuery)}`;

document.getElementById("mapsStart").href = startMapsUrl;
document.getElementById("mapsPub").href = pubMapsUrl;

// Embed maps without needing an API key:
document.getElementById("startMap").src = `https://www.google.com/maps?q=${q(EVENT.startQuery)}&output=embed`;
document.getElementById("pubMap").src   = `https://www.google.com/maps?q=${q(EVENT.pubQuery)}&output=embed`;

// ---- FAQ accordion ----
const questions = document.querySelectorAll(".faq-q");
questions.forEach(btn => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    // close all
    questions.forEach(b => {
      b.setAttribute("aria-expanded", "false");
      const a = b.nextElementSibling;
      if (a) a.classList.remove("open");
    });
    // open clicked if it was closed
    if (!expanded) {
      btn.setAttribute("aria-expanded", "true");
      const answer = btn.nextElementSibling;
      if (answer) answer.classList.add("open");
    }
  });
});

// ---- Add to Calendar (.ics download) ----
// Uses local date/time but exports as UTC for broad compatibility.
function pad(n){ return String(n).padStart(2, "0"); }

function makeICS() {
  const [hh, mm] = EVENT.startTimeLocal.split(":").map(Number);

  // Create a Date in local time (user's system). For simplicity, we generate UTC timestamps.
  // If you need strict Melbourne timezone handling across devices, tell me and I’ll adjust with a TZID.
  const startLocal = new Date(`${EVENT.dateISO}T${pad(hh)}:${pad(mm)}:00`);
  const endLocal = new Date(startLocal.getTime() + EVENT.durationMinutes * 60000);

  const toICSDate = (d) => {
    // UTC format: YYYYMMDDTHHMMSSZ
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) + "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) + "Z"
    );
  };

  const uid = `${Date.now()}@mordi-pier-to-pub`;
  const dtstamp = toICSDate(new Date());
  const dtstart = toICSDate(startLocal);
  const dtend = toICSDate(endLocal);

  const description =
`Start: ${EVENT.startQuery}
Swim: ~1.2km along the water
After: ${EVENT.pubQuery}

Event page: (paste your link here once published)`;

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mordi Pier to Pub//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${EVENT.title}
LOCATION:${EVENT.startQuery} then ${EVENT.pubQuery}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
END:VEVENT
END:VCALENDAR`;

  return ics;
}

document.getElementById("addToCalendar").addEventListener("click", (e) => {
  e.preventDefault();
  const blob = new Blob([makeICS()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "mordi-pier-to-pub.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 5000);
});
// ---- RSVP ----
const nameInput = document.getElementById("rsvpName");
const rsvpBtn = document.getElementById("rsvpBtn");
const rsvpList = document.getElementById("rsvpList");

function loadRSVP(){
  const names = JSON.parse(localStorage.getItem("rsvpNames") || "[]");
  rsvpList.innerHTML = "";
  names.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    rsvpList.appendChild(li);
  });
}

rsvpBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if(!name) return;

  let names = JSON.parse(localStorage.getItem("rsvpNames") || "[]");

  if(!names.includes(name)){
    names.push(name);
    localStorage.setItem("rsvpNames", JSON.stringify(names));
  }

  nameInput.value = "";
  loadRSVP();
});

loadRSVP();
