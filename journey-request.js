(() => {
  "use strict";

  const form = document.getElementById("journey-request-form");
  const status = document.getElementById("journey-form-status");
  const requestPolicy = globalThis.ReachByJourneyRequestPolicy;

  if (!(form instanceof HTMLFormElement) || !(status instanceof HTMLElement) || !requestPolicy) {
    return;
  }

  const maximumLengths = Object.freeze({
    origin: 80,
    destination: 80,
    departureWindow: 120,
    notes: 300,
  });
  const travellerCounts = Object.freeze(["1", "2", "3", "4", "5+"]);
  const priorities = Object.freeze([
    "Best overall trade-off",
    "Lowest likely total",
    "Shortest complete journey",
    "Fewest mode handovers",
    "Lower connection risk",
  ]);
  const allControlCharacters = /[\u0000-\u001f\u007f]/;
  const disallowedNotesCharacters = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

  const readControl = (name) => {
    const control = form.elements.namedItem(name);
    if (
      control instanceof HTMLInputElement ||
      control instanceof HTMLSelectElement ||
      control instanceof HTMLTextAreaElement
    ) {
      return control;
    }
    return null;
  };

  const readText = (name, maximumLength, allowNotesNewlines = false) => {
    const control = readControl(name);
    if (control === null) {
      return null;
    }

    const rawValue = control.value;
    if (
      (allowNotesNewlines && disallowedNotesCharacters.test(rawValue)) ||
      (!allowNotesNewlines && allControlCharacters.test(rawValue))
    ) {
      return null;
    }

    const normalisedValue = allowNotesNewlines
      ? rawValue.replace(/\r\n?/g, "\n")
      : rawValue;
    const trimmedValue = normalisedValue.trim();
    if (trimmedValue.length > maximumLength) {
      return null;
    }
    return trimmedValue;
  };

  const showPreparationError = (message) => {
    status.textContent = message;
  };

  const markPrivateDetail = (control, problem, fieldLabel) => {
    if (problem === null || control === null) {
      return false;
    }
    control.setCustomValidity(
      `${fieldLabel} contains ${problem}. Remove it and email private detail separately only if the operator requests it.`,
    );
    control.reportValidity();
    control.focus();
    showPreparationError("Please remove private or exact-location detail before preparing the email.");
    return true;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    for (const name of ["origin", "destination", "departureWindow", "notes"]) {
      const control = readControl(name);
      if (control) {
        control.setCustomValidity("");
      }
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    prepareEmail();
  });

  const prepareEmail = () => {
    const origin = readText("origin", maximumLengths.origin);
    const destination = readText("destination", maximumLengths.destination);
    const arriveBy = readText("arriveBy", 40);
    const departureWindow = readText(
      "departureWindow",
      maximumLengths.departureWindow,
    );
    const travellerCount = readText("travellerCount", 3);
    const priority = readText("priority", 80);
    const notes = readText("notes", maximumLengths.notes, true);
    const acknowledgment = readControl("acknowledgment");

    if (
      origin === null ||
      destination === null ||
      arriveBy === null ||
      departureWindow === null ||
      travellerCount === null ||
      priority === null ||
      notes === null ||
      !(acknowledgment instanceof HTMLInputElement)
    ) {
      showPreparationError("Please check the journey details and try again.");
      return;
    }

    const originControl = readControl("origin");
    const destinationControl = readControl("destination");
    const departureWindowControl = readControl("departureWindow");
    const notesControl = readControl("notes");
    if (
      markPrivateDetail(originControl, requestPolicy.locationProblem(origin), "Leaving from") ||
      markPrivateDetail(destinationControl, requestPolicy.locationProblem(destination), "Need to reach") ||
      markPrivateDetail(departureWindowControl, requestPolicy.notesProblem(departureWindow), "When could you leave?") ||
      markPrivateDetail(notesControl, requestPolicy.notesProblem(notes), "Notes")
    ) {
      return;
    }

    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(arriveBy) ||
      !travellerCounts.includes(travellerCount) ||
      !priorities.includes(priority) ||
      !acknowledgment.checked
    ) {
      showPreparationError("Please check the journey details and try again.");
      return;
    }

    const subjectOrigin = origin.replace(/\s+/g, " ").slice(0, maximumLengths.origin);
    const subjectDestination = destination
      .replace(/\s+/g, " ")
      .slice(0, maximumLengths.destination);
    const subject = `ReachBy prototype journey: ${subjectOrigin} to ${subjectDestination}`;
    const body = [
      "This request came from the ReachBy free prototype form.",
      "",
      `Leaving from: ${origin}`,
      `Need to reach: ${destination}`,
      `Need to arrive by (destination local time): ${arriveBy}`,
      `When could you leave?: ${departureWindow || "Not provided"}`,
      `Travellers: ${travellerCount}`,
      `Priority: ${priority}`,
      `Notes: ${notes || "Not provided"}`,
      "Acknowledgment: The visitor understands that nothing is sent until they send the email.",
    ].join("\n");
    const mailto =
      `mailto:dominik@reachby.app?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  };
})();
