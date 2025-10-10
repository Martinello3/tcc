# Demo data seeding

This folder contains SQL scripts to populate demo data (core entities and evaluations).

What migrations do now:
- ONLY schema changes; they do NOT seed demo data.

How to create demo data locally (DEV):
- Use the DEV endpoints (available in Development environment):
  - POST /admin/seed-core — creates user principal@gmail.com (qwe123, perfil 'A'), 10 clubs, and 5 players linked to that user
  - POST /admin/seed-evals — adds multiple evaluations per player with realistic dates/scores
  - POST /admin/seed-eval-details — for existing evaluations, inserts detailed records (física, técnica, tática/comportamental)

Or run via psql:
- psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/seed_core_data.sql
- psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/sample_evaluations.sql
- psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/seed_evaluation_details.sql

How to run
1) Ensure the API has applied migrations (it applies automatically on startup). Alternatively, run:
   - dotnet ef database update
2) Then seed using the DEV endpoints above or the psql commands listed.

Notes
- The evaluation rows set nota_fisica, nota_tecnica, nota_tatica_comportamental, and nota_final directly using the same weighting logic as the API (by position). They are ready to drive dashboards and historical charts.
- The evaluation detail script derives plausible values from the existing aggregate scores, and skips evaluations that already have details.
- If you prefer to create evaluations through the API (letting it compute the final note), you can POST to `/api/jogadores/{id}/avaliacoes` with header `X-User-Id: <user id>`; see AvaliacoesController for the DTO format.

