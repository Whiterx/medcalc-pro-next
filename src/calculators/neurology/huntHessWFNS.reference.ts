export const HUNT_HESS_WFNS_REFERENCE = {
  title: 'Hunt–Hess and WFNS grading scales for aneurysmal subarachnoid haemorrhage',
  organization: 'American Heart Association / American Stroke Association; Neurocritical Care Society; National Institute of Neurological Disorders and Stroke',
  version: 'Hunt–Hess grades I–V; original WFNS grades I–V',
  urls: [
    'https://www.ahajournals.org/doi/10.1161/STR.0000000000000436',
    'https://www.neurocriticalcare.org/Portals/0/ENLS%205.0/ENLS%206.0/Protocol%20V6_0_Subarachnoid%20Hemorrhage.pdf',
    'https://cde.nlm.nih.gov/deView?tinyId=1F_rkZ588GA',
  ],
  accessed: '2026-11-26',
  notes: [
    'AHA/ASA 2023 recommends a clinical severity scale such as Hunt–Hess or WFNS for initial severity assessment and outcome prediction in aneurysmal subarachnoid haemorrhage.',
    'WFNS uses GCS and major focal motor deficit: I = GCS 15 without deficit; II = GCS 13–14 without deficit; III = GCS 13–14 with deficit; IV = GCS 7–12 with or without deficit; V = GCS 3–6 with or without deficit. Aphasia is treated as equivalent to motor deficit in commonly used WFNS definitions.',
    'GCS 15 with a major focal motor deficit is not represented by the standard WFNS I–V categories; the calculator flags this combination instead of assigning a grade.',
    'Hunt–Hess and WFNS are separate clinical grading systems. Their grades are not added, averaged, or converted into each other.',
    'These scales are used for clinical severity description in subarachnoid haemorrhage and are not diagnostic tests. Do not use a grade alone to determine treatment limitation or withhold aneurysm treatment.',
    'This implementation reports the base Hunt–Hess grade and does not automatically apply optional historical grade modifiers such as serious systemic illness or angiographic vasospasm.',
  ],
} as const
