const ROADMAP_LANES = ["now", "next", "later", "doneRecently", "cancelledOrParked"];

export function detectDrift({ roadmap, epics }) {
  const warnings = [];
  const { targetsById, requirementsById, duplicateWarnings } = indexEpics(epics ?? []);

  warnings.push(...duplicateWarnings);

  for (const item of getRoadmapItems(roadmap)) {
    const target = targetsById.get(item.id);

    if (!target) {
      warnings.push({
        severity: "warning",
        code: "roadmap-ref-missing",
        message: `Roadmap item ${item.id} does not reference a known epic, slice, or requirement.`,
        sourceRef: item.sourceRef,
        relatedRef: item.detailRef ?? item.evidenceRef ?? roadmap?.filePath ?? item.id,
      });
      continue;
    }

    if (item.lane === "doneRecently" && target.deliveryStatus !== "done") {
      warnings.push({
        severity: "warning",
        code: "roadmap-done-target-not-done",
        message: `Done Recently item ${item.id} references a target with delivery status ${target.deliveryStatus}.`,
        sourceRef: item.sourceRef,
        relatedRef: target.sourceRef,
      });
    }
  }

  for (const epic of epics ?? []) {
    for (const requirement of epic.requirements ?? []) {
      const existingEvidence = requirement.existingEvidence ?? [];

      if (requirement.deliveryStatus === "done" && existingEvidence.length === 0) {
        warnings.push({
          severity: "warning",
          code: "requirement-done-missing-evidence",
          message: `Requirement ${requirement.id} is done but has no existing evidence.`,
          sourceRef: requirement.sourceRef,
          relatedRef: epic.filePath ?? epic.sourceRef ?? epic.id,
        });
      }
    }

    for (const slice of epic.slices ?? []) {
      if (slice.deliveryStatus !== "done") continue;

      for (const requirementId of slice.covers ?? []) {
        const requirement = requirementsById.get(requirementId);
        if (requirement?.deliveryStatus === "done") continue;

        warnings.push({
          severity: "warning",
          code: "slice-done-with-open-requirements",
          message: `Slice ${slice.id} is done but covers missing or open requirement ${requirementId}.`,
          sourceRef: slice.sourceRef,
          relatedRef: requirement?.sourceRef ?? `missing requirement ${requirementId}`,
        });
      }
    }
  }

  return warnings;
}

function getRoadmapItems(roadmap) {
  return ROADMAP_LANES.flatMap((lane) => {
    const items = roadmap?.lanes?.[lane] ?? [];
    return items.map((item) => ({ ...item, lane }));
  });
}

function indexEpics(epics) {
  const targetsById = new Map();
  const requirementsById = new Map();
  const duplicateWarnings = [];

  for (const epic of epics) {
    addTarget({
      targetsById,
      duplicateWarnings,
      id: epic.id,
      deliveryStatus: epic.status,
      sourceRef: epic.sourceRef ?? epic.filePath ?? epic.id,
    });

    for (const slice of epic.slices ?? []) {
      addTarget({
        targetsById,
        duplicateWarnings,
        id: slice.id,
        deliveryStatus: slice.deliveryStatus,
        sourceRef: slice.sourceRef,
      });
    }

    for (const requirement of epic.requirements ?? []) {
      addTarget({
        targetsById,
        duplicateWarnings,
        id: requirement.id,
        deliveryStatus: requirement.deliveryStatus,
        sourceRef: requirement.sourceRef,
      });

      if (!requirementsById.has(requirement.id)) {
        requirementsById.set(requirement.id, requirement);
      }
    }
  }

  return { targetsById, requirementsById, duplicateWarnings };
}

function addTarget({ targetsById, duplicateWarnings, id, deliveryStatus, sourceRef }) {
  if (!targetsById.has(id)) {
    targetsById.set(id, { id, deliveryStatus, sourceRef });
    return;
  }

  const firstTarget = targetsById.get(id);

  duplicateWarnings.push({
    severity: "warning",
    code: "duplicate-id",
    message: `Duplicate id ${id} appears in ${firstTarget.sourceRef} and ${sourceRef}. Keeping the first target.`,
    sourceRef,
    relatedRef: firstTarget.sourceRef,
  });
}
