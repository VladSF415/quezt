import { defineRailway, project, service } from "railway/iac";

// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "quezt";

export default defineRailway(() => {
  const quezt = service("quezt", {
    start: "npm run start",
    preDeploy: "npm run release",
    // builder from CaC: "NIXPACKS"
  });
  return project("quezt", {
    resources: [quezt],
  });
});
