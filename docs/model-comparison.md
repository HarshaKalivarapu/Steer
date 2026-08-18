# Model comparison

Same prompt, same booklet and seed bank, same schema, 5 `rules` questions,
`max_tokens: 8000`, no exclusions. Only the model string differs.

| model | time | cost | stem words | option words | explanation words |
| --- | --- | --- | --- | --- | --- |
| claude-opus-5 | 27s | $0.371 | 15.4 | 3.6 | 14.7 |
| claude-sonnet-5 | 24s | $0.231 | 18.8 | 3.9 | 10.6 |

Seed bank targets: stems ~15 words, options ~5 words, explanations ~13 words.
## claude-opus-5

27s · $0.371 · stems 15.4 words · options 3.6 words (longest 7) · explanations 14.7 words

**1. [easy]** Ohio law requires you to turn on your headlights whenever you use your

- A) windshield wipers  ← **correct**
  - *Correct. Ohio requires headlights any time the wipers are running, since visibility is already reduced.*
- B) turn signals
  - *Signals are used constantly in clear daylight, so they have nothing to do with the lighting law.*
- C) horn
  - *The horn is a warning device only. Using it never triggers a headlight requirement.*
- D) emergency flashers
  - *Flashers warn others of a stopped or slow vehicle; they are not tied to the headlight rule.*

**2. [medium]** You may not park your vehicle within ________ of a fire hydrant.

- A) 5 feet
  - *Too close. Firefighters would not have room to connect hoses to the hydrant.*
- B) 20 feet
  - *Twenty feet is Ohio's distance from a crosswalk or intersection, not from a hydrant.*
- C) 30 feet
  - *Thirty feet applies to a stop sign, flashing beacon, or traffic signal instead.*
- D) 10 feet  ← **correct**
  - *Correct. Ohio prohibits stopping, standing, or parking within 10 feet of a fire hydrant.*

**3. [medium]** You approach a railroad crossing and the red lights begin to flash. Where must you stop?

- A) At least 5 feet from the crossing
  - *Five feet leaves you far too close to a passing train and to lowering gates.*
- B) Between 15 and 50 feet from it  ← **correct**
  - *Correct. Ohio requires a stop no closer than 15 feet and no farther than 50 feet.*
- C) Anywhere behind the crossbuck sign
  - *The crossbuck marks the tracks but does not set the legal stopping distance.*
- D) At least 100 feet from the crossing
  - *One hundred feet is the no-passing distance near a crossing, not the stopping distance.*

**4. [medium]** The traffic signal at a busy intersection is completely dark and no officer is present. You must

- A) proceed without slowing down
  - *A dark signal controls nothing, so entering at speed means crossing traffic with no protection.*
- B) treat it as a flashing yellow light
  - *That would let you roll through. Ohio requires more than caution when the signal is dead.*
- C) treat it as a four-way stop  ← **correct**
  - *Correct. Ohio law says drivers must treat a non-working signal as a four-way stop.*
- D) wait until the signal works again
  - *Power may be out for hours. The law gives you a way to proceed safely instead.*

**5. [hard]** A driver under 21 years of age can be charged with underage consumption at a BAC of at least

- A) .02 percent  ← **correct**
  - *Correct. Ohio charges drivers under 21 at .02 percent, far below the adult limit.*
- B) .05 percent
  - *No Ohio threshold uses .05 percent for any age group of drivers.*
- C) .08 percent
  - *That is the limit for drivers 21 and over. Younger drivers are held to a stricter one.*
- D) .17 percent
  - *A BAC of .17 percent brings the enhanced penalties for a convicted OVI offender.*

## claude-sonnet-5

24s · $0.231 · stems 18.8 words · options 3.9 words (longest 9) · explanations 10.6 words

**1. [easy]** You may not park within how many feet of a fire hydrant?

- A) 5 feet
  - *Too close. Ohio requires more clearance so firefighters can connect hoses quickly.*
- B) 10 feet  ← **correct**
  - *Correct. Ohio law prohibits parking within 10 feet of a fire hydrant.*
- C) 15 feet
  - *Overstates the rule. Ten feet, not fifteen, is the actual Ohio distance.*
- D) 20 feet
  - *Much farther than Ohio law requires for hydrant clearance.*

**2. [medium]** You stop at a red light on a one-way street, and the cross street is also one-way. You want to turn left. What should you do?

- A) Stop, then turn left if no sign forbids it  ← **correct**
  - *Correct. Left on red is allowed only from one one-way street onto another.*
- B) Wait for a green light always
  - *Unnecessarily cautious. Ohio permits this specific left turn on red.*
- C) Turn left only with an officer present
  - *No officer is needed for this legal left-on-red movement.*
- D) Turn left without stopping if clear
  - *A complete stop is always required first, even when the way looks clear.*

**3. [medium]** A driver under age 21 can be charged with an offense for a BAC of at least what percentage?

- A) 0.08 percent
  - *That is the adult limit. Drivers under 21 face a much lower threshold.*
- B) 0.02 percent  ← **correct**
  - *Correct. Ohio charges underage drivers at BAC levels as low as 0.02 percent.*
- C) 0.05 percent
  - *Not the figure Ohio uses for underage drivers.*
- D) 0.10 percent
  - *Far above both the adult and underage legal limits.*

**4. [medium]** The car ahead of you signals a left turn on a two-lane road. May you legally pass it on the right?

- A) Yes, if it can be done safely  ← **correct**
  - *Correct. Passing on the right is allowed when a vehicle ahead is turning left.*
- B) No, passing on the right is never allowed
  - *Ohio permits it in specific cases, including this one.*
- C) Only if the speed limit is under 25
  - *Speed limit has no bearing on this passing rule.*
- D) Only after dark
  - *Time of day is not part of this rule.*

**5. [hard]** Accumulating how many points within a two-year period leads to an automatic license suspension in Ohio?

- A) 6 points
  - *Six points only triggers a warning letter, not a suspension.*
- B) 9 points
  - *Not an Ohio threshold for any licensing action.*
- C) 12 points  ← **correct**
  - *Correct. Twelve or more points in two years results in a six-month suspension.*
- D) 15 points
  - *Higher than the actual Ohio suspension threshold.*
