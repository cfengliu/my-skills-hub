const ROADMAP_LANES = ["now", "next", "later", "doneRecently", "cancelledOrParked"];

export function detectDrift({ roadmap, epics }) {
  const warnings = [];
  const targetsById = indexTargets(epics ?? []);
  const requirementsById = indexRequirements(epics ?? []);

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

      const openRequirement = (slice.covers ?? []).find((requirementId) => {
        const requirement = requirementsById.get(requirementId);
        return !requirement || requirement.deliveryStatus !== "done";
      });

      if (openRequirement) {
        const requirement = requirementsById.get(openRequirement);

        warnings.push({
          severity: "warning",
          code: "slice-done-with-open-requirements",
          message: `Slice ${slice.id} is done but covers missing or open requirement ${openRequirement}.`,
          sourceRef: slice.sourceRef,
          relatedRef: requirement?.sourceRef ?? openRequirement,
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

function indexTargets(epics) {
  const targets = new Map();

  for (const epic of epics) {
    targets.set(epic.id, {
      id: epic.id,
      deliveryStatus: epic.status,
      sourceRef: epic.sourceRef ?? epic.filePath ?? epic.id,
    });

    for (const slice of epic.slices ?? []) {
      targets.set(slice.id, {
        id: slice.id,
        deliveryStatus: slice.deliveryStatus,
        sourceRef: slice.sourceRef,
      });
    }

    for (const requirement of epic.requirements ?? []) {
      targets.set(requirement.id, {
        id: requirement.id,
        deliveryStatus: requirement.deliveryStatus,
        sourceRef: requirement.sourceRef,
      });
    }
  }

  return targets;
}

function indexRequirements(epics) {
  const requirements = new Map();

  for (const epic of epics) {
    for (const requirement of epic.requirements ?? []) {
      requirements.set(requirement.id, requirement);
    }
  }

  return requirements;
}
