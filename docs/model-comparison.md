# Model comparison

Same prompt, same booklet and seed bank, same schema, 5 `rules` questions,
`max_tokens: 8000`, effort `medium`, no exclusions. Only the model string differs.

| model | time | cost | stem words | option words | explanation words |
| --- | --- | --- | --- | --- | --- |
| claude-opus-5 | 19s | $0.380 | 14.0 | 4.7 | 13.3 |
| claude-sonnet-5 | 18s | $0.233 | 16.4 | 4.8 | 14.4 |

Seed bank targets: stems ~15 words, options ~5 words, explanations ~13 words.
## claude-opus-5

19s · $0.380 · stems 14.0 words · options 4.7 words (longest 8) · explanations 13.3 words

**1. [easy]** Ohio law requires your headlights to be on at which of these times?

- A) Between sunset and sunrise
  - *True, but the manual lists several other required times as well.*
- B) During rain, snow, or fog
  - *True, but incomplete. Poor visibility is only one of the listed conditions.*
- C) Any time the wipers are running
  - *True, but incomplete. Wiper use is one of several listed triggers.*
- D) All of the above  ← **correct**
  - *Correct. Ohio requires lights from sunset to sunrise, in poor visibility, and whenever wipers run for precipitation.*

**2. [medium]** You must not park your vehicle within _________ of a fire hydrant.

- A) 5 feet
  - *Too short. Ohio's stated distance from a hydrant is larger than this.*
- B) 10 feet  ← **correct**
  - *Correct. Ohio law prohibits stopping, parking, or standing within 10 feet of a fire hydrant.*
- C) 20 feet
  - *Twenty feet is Ohio's distance from an intersection or crosswalk, not a hydrant.*
- D) 30 feet
  - *No Ohio parking restriction in the manual uses 30 feet.*

**3. [medium]** You are stopped at a railroad crossing while a train approaches. Your vehicle must stop no closer than:

- A) 5 feet from the crossing
  - *Far too close to the tracks to be safe, and below Ohio's stated minimum.*
- B) 10 feet from the crossing
  - *Ten feet is the school bus stopping distance, not the railroad figure.*
- C) 15 feet from the crossing  ← **correct**
  - *Correct. Ohio requires stopping no closer than 15 feet and no farther than 50 feet from the crossing.*
- D) 50 feet from the crossing
  - *Fifty feet is the farthest you may stop, not the closest.*

**4. [hard]** Which of the following statements about passing a slow-moving vehicle is FALSE?

- A) You may exceed the speed limit while passing  ← **correct**
  - *Correct, this is false. Ohio states you must not exceed the speed limit while passing a slow-moving vehicle.*
- B) You may cross a solid yellow line
  - *True. Crossing a solid yellow line is permitted to pass a slow-moving vehicle.*
- C) The vehicle must travel under half the limit
  - *True. Ohio allows the pass only if the vehicle moves slower than half the posted speed limit.*
- D) There must be clear space ahead
  - *True. Sufficient clear space in the oncoming lane is required before passing.*

**5. [hard]** A driver accumulates 12 or more points within two years. What does the BMV do?

- A) Sends a warning letter only
  - *The warning letter is sent at six points, not at twelve.*
- B) Imposes a license suspension  ← **correct**
  - *Correct. Twelve or more points in two years brings a 12-point suspension of the Driver License.*
- C) Requires a new vision screening
  - *The manual does not list vision screening as a point-suspension reinstatement requirement.*
- D) Doubles the driver's fines
  - *Doubled fines apply to work zone speeding, not to point accumulation.*

## claude-sonnet-5

18s · $0.233 · stems 16.4 words · options 4.8 words (longest 10) · explanations 14.4 words

**1. [easy]** You are pulling out of a private driveway onto a public street. Who must you yield to?

- A) No one, since you are already moving
  - *Movement does not grant right-of-way; drivers already on the roadway have priority over you.*
- B) Only vehicles turning left
  - *The yield applies to all traffic on the roadway, not just vehicles turning left.*
- C) Drivers already on the public street  ← **correct**
  - *Correct. Ohio law requires yielding to traffic on the highway when entering from a driveway or private road.*
- D) Only vehicles behind you
  - *Vehicles behind you are not the concern; the danger is traffic already moving on the street you are entering.*

**2. [medium]** You see a tow truck stopped on the shoulder with its warning lights flashing. You should:

- A) Move over a lane or slow down  ← **correct**
  - *Correct. Ohio's Move Over law requires changing lanes away from the vehicle, or slowing if a lane change is unsafe.*
- B) Stop directly behind it
  - *Stopping in the roadway near a stopped service vehicle creates a hazard rather than avoiding one.*
- C) Sound your horn and pass at normal speed
  - *A horn does nothing here, and passing at normal speed ignores the required slow-down or lane change.*
- D) Flash your headlights and continue at the same speed
  - *Flashing lights communicates nothing useful; the law requires actually slowing or moving over.*

**3. [hard]** A train is approaching a crossing. How close to the tracks may you stop your vehicle?

- A) No closer than 5 feet, no farther than 25 feet
  - *These distances are too short; Ohio's minimum and maximum are both greater.*
- B) No closer than 15 feet, no farther than 50 feet  ← **correct**
  - *Correct. Ohio law sets this range so you are clear of the train but close enough to see the crossing.*
- C) No closer than 30 feet, no farther than 75 feet
  - *This overstates the required distance from the tracks.*
- D) Anywhere before the crossbuck sign
  - *This ignores the specific distance range Ohio law sets for stopping near an approaching train.*

**4. [medium]** What is the maximum legal blood alcohol concentration (BAC) for a driver under age 21 in Ohio?

- A) 0.08%
  - *This is the limit for drivers 21 and older, not for underage drivers.*
- B) 0.04%
  - *This is the limit that applies to commercial drivers, not underage drivers.*
- C) 0.10%
  - *This exceeds even the adult limit and is not an Ohio standard.*
- D) 0.02%  ← **correct**
  - *Correct. Ohio sets a stricter 0.02% limit for drivers under age 21.*

**5. [easy]** You may not stop or park your vehicle within how many feet of a fire hydrant?

- A) 10 feet  ← **correct**
  - *Correct. Ohio law prohibits stopping, parking, or standing within 10 feet of a fire hydrant.*
- B) 20 feet
  - *20 feet is the distance Ohio sets for intersections and crosswalks, not fire hydrants.*
- C) 5 feet
  - *This understates the distance Ohio law actually requires from a fire hydrant.*
- D) 15 feet
  - *This is not the distance Ohio's parking law specifies for a fire hydrant.*
