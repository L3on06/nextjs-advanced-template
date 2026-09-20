import type { StepDef } from "../types";
import {
  brandingStep,
  designStep,
  iconsStep,
  languagesStep,
  metadataStep,
  typographyStep,
} from "./brand";
import {
  errorsStep,
  generateStep,
  reviewStep,
  seoStep,
} from "./finish";
import {
  bootstrapStep,
  emulatorStep,
  firebaseAdminStep,
  firebaseAuthStep,
  firebaseProjectStep,
  firestoreStep,
  functionsStep,
  storageStep,
} from "./foundation";
import {
  navigationStep,
  permissionsStep,
  redirectsStep,
  resourcesStep,
  rolesStep,
  routesStep,
  statusesStep,
} from "./model";

/** All 25 wizard steps in run order. */
export const ALL_STEPS: StepDef[] = [
  bootstrapStep,
  firebaseProjectStep,
  firebaseAuthStep,
  firebaseAdminStep,
  emulatorStep,
  firestoreStep,
  storageStep,
  functionsStep,
  metadataStep,
  designStep,
  typographyStep,
  iconsStep,
  brandingStep,
  languagesStep,
  rolesStep,
  permissionsStep,
  resourcesStep,
  routesStep,
  navigationStep,
  redirectsStep,
  statusesStep,
  errorsStep,
  seoStep,
  reviewStep,
  generateStep,
];

export const STEP_IDS = ALL_STEPS.map((step) => step.id);
