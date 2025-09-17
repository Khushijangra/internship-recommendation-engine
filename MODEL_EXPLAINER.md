# MODEL_EXPLAINER

## 🧮 Section 1: Scoring Formula
final_score = 0.55 × cosine_similarity + 0.30 × skill_overlap + 0.15 × normalized_rule_boost

- cosine_similarity: TF-IDF cosine between user text and internship text
- skill_overlap: matched user skills ÷ total user skills (normalized skills)
- normalized_rule_boost: rule_boost_raw ÷ 3.0 based on location, education, experience, mode

## 🧠 Section 2: Lightweight & Explainable
- Lightweight: TF-IDF + cosine; minimal compute, no heavy models
- Explainable: shows MatchedSkills, location/mode alignment, and component scores
- Transparent: Final score is a weighted sum with fixed weights (0.55/0.30/0.15)

## 📊 Section 3: Profile Evaluations
### Profile 1
Education: Ug | Location: Bhopal | Mode: Offline | Language: Hindi
Skills: Sql, Cd, React, Html, Public Speaking
Top Recommendations:
1. INT0987 — it & software / tech intern (Score: 0.3229)
   Cosine: 0.2779 | Skills: 0.4 | RuleBoost: 1.0
   Reason: Matched skills: react, sql; Location: remote allowed; Mode: prefers offline, offered online; Content similarity: moderate; Profile alignment: strong (Matched: react, sql)
2. INT0950 — it & software / tech intern (Score: 0.3227)
   Cosine: 0.2776 | Skills: 0.4 | RuleBoost: 1.0
   Reason: Matched skills: react, sql; Location: different; Mode: matched; Content similarity: moderate; Profile alignment: strong (Matched: react, sql)
3. INT0809 — it & software / tech intern (Score: 0.3194)
   Cosine: 0.2717 | Skills: 0.4 | RuleBoost: 1.0
   Reason: Matched skills: react, sql; Location: remote allowed; Mode: prefers offline, offered online; Content similarity: moderate; Profile alignment: strong (Matched: react, sql)

### Profile 2
Education: Pg | Location: Chennai | Mode: Online | Language: English
Skills: Wireframing, Communication, Excel, Jira
Top Recommendations:
1. INT0875 — banking & financial services intern (Score: 0.3626)
   Cosine: 0.3866 | Skills: 0.25 | RuleBoost: 1.5
   Reason: Matched skills: microsoft excel; Location: remote allowed; Mode: matched; Content similarity: high; Profile alignment: strong (Matched: microsoft excel)
2. INT0989 — banking & financial services intern (Score: 0.3585)
   Cosine: 0.3791 | Skills: 0.25 | RuleBoost: 1.5
   Reason: Matched skills: microsoft excel; Location: same city; Mode: prefers online, offered offline; Content similarity: high; Profile alignment: strong (Matched: microsoft excel)
3. INT0075 — credit analysis intern (Score: 0.3573)
   Cosine: 0.2405 | Skills: 0.5 | RuleBoost: 1.5
   Reason: Matched skills: communication, microsoft excel; Location: remote allowed; Mode: matched; Content similarity: moderate; Profile alignment: strong (Matched: communication, microsoft excel)

### Profile 3
Education: Diploma | Location: Pune | Mode: Online | Language: Hindi
Skills: Inspection Protocols, Microcontrollers, C, C++, Six Sigma Basics, Public Speaking
Top Recommendations:
1. INT0098 — quality assurance intern (Score: 0.3481)
   Cosine: 0.3147 | Skills: 0.3333 | RuleBoost: 1.5
   Reason: Matched skills: inspection protocols, six sigma basics; Location: same city; Mode: matched; Content similarity: high; Profile alignment: strong (Matched: inspection protocols, six sigma basics)
2. INT0295 — quality assurance intern (Score: 0.3463)
   Cosine: 0.3114 | Skills: 0.3333 | RuleBoost: 1.5
   Reason: Matched skills: inspection protocols, six sigma basics; Location: remote allowed; Mode: matched; Content similarity: high; Profile alignment: strong (Matched: inspection protocols, six sigma basics)
3. INT0087 — quality assurance intern (Score: 0.3089)
   Cosine: 0.3343 | Skills: 0.3333 | RuleBoost: 0.5
   Reason: Matched skills: inspection protocols, six sigma basics; Location: different; Mode: prefers online, offered offline; Content similarity: high; Profile alignment: good (Matched: inspection protocols, six sigma basics)

### Profile 4
Education: 12Th Pass | Location: Delhi | Mode: Online | Language: English
Skills: Process Simulation, Safety Protocols, Report Writing
Top Recommendations:
1. INT0244 — field operations intern (Score: 0.4363)
   Cosine: 0.2932 | Skills: 0.6667 | RuleBoost: 1.5
   Reason: Matched skills: report writing, safety protocols; Location: same city; Mode: prefers online, offered hybrid; Content similarity: moderate; Profile alignment: strong (Matched: report writing, safety protocols)
2. INT0214 — field operations intern (Score: 0.4219)
   Cosine: 0.3126 | Skills: 0.6667 | RuleBoost: 1.0
   Reason: Matched skills: report writing, safety protocols; Location: remote allowed; Mode: matched; Content similarity: high; Profile alignment: strong (Matched: report writing, safety protocols)
3. INT0229 — field operations intern (Score: 0.4208)
   Cosine: 0.3106 | Skills: 0.6667 | RuleBoost: 1.0
   Reason: Matched skills: report writing, safety protocols; Location: remote allowed; Mode: matched; Content similarity: high; Profile alignment: strong (Matched: report writing, safety protocols)

### Profile 5
Education: 12Th Pass | Location: Kolkata | Mode: Online | Language: Hindi
Skills: Basic Html, Communication, Ms Office
Top Recommendations:
1. INT0871 — education, media & entertainment intern (Score: 0.3991)
   Cosine: 0.362 | Skills: 0.3333 | RuleBoost: 2.0
   Reason: Matched skills: communication; Location: same city; Mode: matched; Content similarity: high; Profile alignment: strong (Matched: communication)
2. INT0455 — intern (Score: 0.379)
   Cosine: 0.3708 | Skills: 0.3333 | RuleBoost: 1.5
   Reason: Matched skills: ms office; Location: remote allowed; Mode: matched; Content similarity: high; Profile alignment: strong (Matched: ms office)
3. INT0550 — intern (Score: 0.3738)
   Cosine: 0.3615 | Skills: 0.3333 | RuleBoost: 1.5
   Reason: Matched skills: ms office; Location: remote allowed; Mode: matched; Content similarity: high; Profile alignment: strong (Matched: ms office)

## 📝 Section 4: Evaluation Notes
- Weights provided balanced results across content similarity and profile fit.
- Rule boosts nudged city/state/mode matches effectively without overpowering content.
- Final weights confirmed: 0.55 (cosine), 0.30 (skills), 0.15 (rules).