# Example Questions — Ohio BMV Knowledge Test

This file is the **seed bank**. It gets fed to the model as context so generated tests
match the real exam's style, difficulty, and phrasing. Some seed questions are reused
verbatim in a generated test; the rest are written fresh in this style.

Every question in here comes from an official or published Ohio source — the BMV's own
sample test, or Ohio practice tests. Nothing is invented. That is deliberate: these are
the style and difficulty target, so a made-up question in this file would pull generated
tests away from what the real exam looks like rather than toward it.

## How to add questions

Paste yours in using the exact format below. Keep the `### Q` heading, the four options,
and the `**Answer:**` line — a parser reads this file into JSON, so the shape matters.

Two things that make a seed question actually useful:

- **`Section:` must be `signs` or `rules`.** The real test scores those two halves
  separately, so the generator needs to know which bucket a question belongs to.
- **Every option needs a "why".** The app shows an explanation under *all four* options
  after she answers, not just the correct one. Explaining why a distractor is wrong is
  where most of the learning happens.

Difficulty is `easy` | `medium` | `hard`. Don't overthink it — it's used to keep the mix
balanced, not to gate anything.

To show a sign on screen, add a `Sign:` line naming an id from `lib/signs.ts` (run
`npm run signs` for the list). The app draws it above the question, so the stem must not
describe or name the sign — see the sign-appearance section below for that format.

### Template

```
### Q
Section: rules
Difficulty: medium
Question text goes here?

- A) First option
  - Why: One or two lines on why this is right or wrong.
- B) Second option
  - Why: ...
- C) Third option
  - Why: ...
- D) Fourth option
  - Why: ...

**Answer:** B
```

---

## Official BMV Sample Test

Taken from the Ohio BMV's own published sample knowledge test, so these are the
highest-trust anchors in this file — the phrasing and difficulty here are what a real test
question actually looks like. Prefer reusing these over the drafted ones below.

Two were edited; both edits are noted on the question itself.

### Q
Section: rules
Difficulty: easy
What is the most important driving technique to avoid crashes when driving in icy or snowy conditions?

- A) Add extra weight to the vehicle to improve traction
  - Why: Added weight does not restore grip on ice, and it lengthens your stopping distance once you are moving.
- B) Get off the highways as quickly as possible
  - Why: Hurrying is itself the hazard. Leaving the road sooner does nothing if you are still driving too fast for the surface.
- C) Engage four wheel drive on the vehicle
  - Why: Four wheel drive helps you accelerate, not stop or steer. On ice it mostly produces false confidence.
- D) Reduce speed and increase following distance
  - Why: Correct. Ice takes away traction and reaction room. Slowing down and backing off give you more of each.

**Answer:** D

### Q
Section: signs
Difficulty: easy
A flashing red traffic signal at an intersection has the same requirements as which of the following?

- A) A slow sign
  - Why: There is no such regulatory sign, and a flashing red demands more than slowing.
- B) A yield sign
  - Why: A yield lets you roll through without stopping when the way is clear. A flashing red does not.
- C) A stop sign
  - Why: Correct. Come to a complete stop, then proceed when it is safe.
- D) An intersection sign
  - Why: That is a warning sign telling you an intersection is ahead. It does not control who stops.

**Answer:** C

### Q
Section: rules
Difficulty: medium
The application for an operator's license must be signed by the parent or guardian when the applicant is under what age?

- A) 16
  - Why: Applicants between 16 and 18 are still minors and still need the signature.
- B) 20
  - Why: Ohio uses 18 as the age of majority here, not 20.
- C) 21
  - Why: 21 is the threshold for alcohol and for renting vehicles, not for licensing consent.
- D) 18
  - Why: Correct. Anyone under 18 needs a parent or guardian to sign the application.

**Answer:** D

### Q
Section: rules
Difficulty: medium
Unless it is posted otherwise, the speed limit in a residential area is:

- A) 25 miles per hour
  - Why: Correct. 25 mph is Ohio's default limit in residential and municipal areas when nothing is posted.
- B) 20 miles per hour
  - Why: 20 mph is the Ohio school zone limit, which is a separate rule.
- C) 35 miles per hour
  - Why: 35 mph applies on state routes inside a municipality outside a business district, not to residential streets.
- D) 15 miles per hour
  - Why: Ohio sets no general 15 mph limit.

**Answer:** A

### Q
Section: rules
Difficulty: hard
*Rewritten. In the official version the correct answer was a 60-word paragraph sitting next to three short distractors, so it was identifiable by length alone. Same law, asked as a question.*

In Ohio, a child must ride in a booster seat until they reach:

- A) Age 8, or 4 feet 9 inches tall, whichever comes first
  - Why: Correct. Boosters are required from age 4 until age 8, unless the child already stands 4 feet 9 inches. Before age 4, or under 40 pounds, an approved child safety seat is required instead.
- B) Age 6
  - Why: This understates the requirement. Ohio's booster rule runs to age 8, not 6.
- C) Age 10
  - Why: This overstates it. The requirement ends at 8, or earlier if the child reaches 4 feet 9 inches.
- D) The point where their feet reach the vehicle floor
  - Why: A comfortable fit is not the legal standard. Ohio states the rule in age and height.

**Answer:** A

### Q
Section: rules
Difficulty: hard
When traveling on a highway divided into four traffic lanes, which vehicles are required to stop for a school bus that has stopped to unload children?

- A) Only vehicles approaching the rear of the bus traveling in the same direction as the bus
  - Why: Correct. On a road of four or more lanes, only traffic behind the bus and moving the same way must stop.
- B) All vehicles approaching the bus from either direction
  - Why: That is the rule on roads of fewer than four lanes. The lane count is what changes the answer.
- C) No one is required to stop unless children are in view
  - Why: The flashing red lights create the duty to stop. Whether you can see children does not matter.
- D) All vehicles may pass the bus after providing an audible signal
  - Why: Sounding the horn never authorizes passing a stopped school bus.

**Answer:** A

### Q
Section: rules
Difficulty: medium
When two vehicles arrive at an intersection at the same time, which one has the right-of-way when no signs or signals indicate rules?

- A) The car approaching from the right has the right-of-way
  - Why: Correct. On a simultaneous arrival, the driver on the right goes first.
- B) The car approaching from the left has the right-of-way
  - Why: This reverses the rule.
- C) The car in which the driver sounds his horn first has the right-of-way
  - Why: A horn is a warning device. It confers no right-of-way at all.
- D) The car that is traveling faster has the right-of-way
  - Why: Speed grants nothing, and arriving fast is the behavior this rule exists to discourage.

**Answer:** A

### Q
Section: rules
Difficulty: easy
If someone has consumed alcoholic drinks, what will help the person overcome the influence of those drinks?

- A) Tomato juice and lime
  - Why: Food and drink do not change how fast the body processes alcohol.
- B) Hot coffee
  - Why: Caffeine makes someone awake, not sober. An alert impaired driver is still an impaired driver.
- C) Fresh air
  - Why: Air has no effect on blood alcohol concentration.
- D) Time
  - Why: Correct. Only time lowers blood alcohol concentration, and nothing speeds that up.

**Answer:** D

### Q
Section: rules
Difficulty: medium
*Option D replaced. The official version read "verifying the turn will interfere with other traffic," apparently a typo for "will not interfere," which left the option unanswerable as written.*

When is a driver permitted to turn right on a red traffic signal?

- A) After stopping and confirming the turn will not interfere with crossing traffic or pedestrians
  - Why: Correct. A complete stop first, then the turn if it is clear.
- B) Only when signs are clearly posted to allow a right turn on red
  - Why: Backwards. Right on red is permitted in Ohio by default, and a sign is what takes it away.
- C) Only at the direction of a police officer
  - Why: No officer is needed for an ordinary right turn on red.
- D) Whenever crossing traffic is clear, without coming to a complete stop
  - Why: The stop is not optional. A clear road does not excuse rolling through a red light.

**Answer:** A

### Q
Section: rules
Difficulty: hard
When a stop is required at an intersection and no markings appear to indicate a stop line or crosswalk, which of the following is the appropriate place to make the stop?

- A) The driver is not required to stop
  - Why: A missing stop line does not remove the duty to stop.
- B) The driver is required to slow down to make sure crossing traffic is clear
  - Why: Slowing is not stopping. The requirement is a complete stop.
- C) Only at a place where the driver can see at least 200 feet on either side without regard for the intersecting roadway
  - Why: There is no 200-foot standard, and ignoring the intersecting roadway is the opposite of the rule's purpose.
- D) At the point nearest the intersecting roadway where the driver has a view of approaching traffic before entering the roadway
  - Why: Correct. With no marked line, stop where you can actually see cross traffic before committing to the intersection.

**Answer:** D

## Practice Bank — Official Phrasing

Collected from Ohio practice tests. Same house style as the official sample above:
full-sentence stems, fill-in-the-blank, "which of the following is FALSE", and
occasional "all of the above". These are the style target for generated questions.

### Q
Section: rules
Difficulty: medium
When you are being passed by another vehicle, you must _________ until the other vehicle has safely passed.

- A) increase your speed and keep right
  - Why: Speeding up while being passed strands the other driver in the oncoming lane. It is both illegal and the classic cause of head-on crashes during a pass.
- B) pull over
  - Why: Leaving the roadway is unnecessary and creates a new hazard. You only need to stay predictable.
- C) maintain a constant speed and keep right
  - Why: Correct. Hold your speed and stay right so the passing driver has a stable target and room to complete the pass.
- D) maintain a constant speed and keep left
  - Why: Constant speed is right, but drifting left closes the gap the other vehicle is using.

**Answer:** C

### Q
Section: rules
Difficulty: medium
You should not exceed the speed limit of ___ if there are no posted speed limit signs when driving on a city road.

- A) 25 mph
  - Why: Correct. 25 mph is Ohio's default limit on city and residential streets when nothing is posted.
- B) 40 mph
  - Why: No Ohio default limit is 40 mph.
- C) 30 mph
  - Why: A common guess, but Ohio's municipal default is 25, not 30.
- D) 35 mph
  - Why: 35 mph applies to urban state routes outside business districts, not ordinary city streets.

**Answer:** A

### Q
Section: signs
Difficulty: medium
The letters "RR" painted on the pavement indicate that you are approaching

- A) a railroad crossing.
  - Why: Correct. A large X with RR painted on the road is the pavement version of the railroad advance warning.
- B) a closed road.
  - Why: A closed road is marked with signs and barricades, never with pavement lettering.
- C) a curve on the right.
  - Why: Curves are warned by yellow diamond signs, not pavement letters.
- D) a road repair zone.
  - Why: Work zones use orange signs and cones.

**Answer:** A

### Q
Section: rules
Difficulty: easy
If you are approached by an emergency vehicle displaying flashing lights and an audible signal, you must

- A) pull over to the right.
  - Why: Correct. Yield to the right edge of the road and stop until it passes, so the emergency vehicle has a predictable path.
- B) increase your speed to stay ahead of the emergency vehicle.
  - Why: This keeps you in its way and delays it.
- C) immediately clear the right lane and pull over to the left.
  - Why: Ohio directs traffic right. Moving left puts you where the emergency vehicle expects a clear lane.
- D) stop where you are.
  - Why: Stopping in a travel lane blocks the very route you are supposed to clear.

**Answer:** A

### Q
Section: rules
Difficulty: hard
In Ohio, which of the following traffic violations carries six penalty points?

- A) Reckless driving
  - Why: Reckless operation is a 4-point violation in Ohio, serious but not the maximum.
- B) Speeding
  - Why: Most speeding violations carry 2 points, or 4 at 30 mph or more over the limit.
- C) Failing to stop at a red traffic light
  - Why: A red-light violation carries 2 points.
- D) Fleeing from a police officer
  - Why: Correct. Fleeing or eluding is one of Ohio's 6-point violations, alongside OVI and drag racing.

**Answer:** D

### Q
Section: rules
Difficulty: medium
In a school zone, the speed limit when children are going to or leaving school is

- A) 30 mph.
  - Why: Far too fast for a school zone under any Ohio rule.
- B) 25 mph.
  - Why: 25 mph is the general residential default, not the school zone limit.
- C) 15 mph.
  - Why: Ohio's school zone limit is 20 mph, not 15.
- D) 20 mph.
  - Why: Correct. 20 mph applies in a school zone while children are going to or leaving school.

**Answer:** D

### Q
Section: rules
Difficulty: hard
In which of the following situations are you NOT allowed to drive in the leftmost lane?

- A) When you are overtaking and passing another vehicle
  - Why: Passing is exactly what the left lane is for.
- B) When you are on a roadway with three or more lanes
  - Why: Lane count alone does not prohibit using the left lane.
- C) When you are on a one-way road
  - Why: On a one-way street every lane is available, including the leftmost.
- D) When you are driving slower than the rest of the traffic
  - Why: Correct. The left lane is for passing and faster traffic. Travelling slower than surrounding traffic there obstructs the flow.

**Answer:** D

### Q
Section: rules
Difficulty: medium
A school bus is stopped with its red lights flashing on a street or road with fewer than four lanes. Which of the following is true?

- A) All vehicles approaching the bus from either direction must slow down.
  - Why: Slowing is not enough on a road of fewer than four lanes. A full stop is required.
- B) All vehicles approaching the bus from behind must stop. Other vehicles must slow down.
  - Why: This is the four-or-more-lane rule leaking in. Below four lanes, oncoming traffic stops too.
- C) All vehicles approaching the bus from either direction must stop.
  - Why: Correct. On a road with fewer than four lanes, traffic in both directions must stop.
- D) All vehicles approaching the bus from either direction must speed up.
  - Why: Never correct near a stopped school bus.

**Answer:** C

### Q
Section: rules
Difficulty: easy
To maintain a safe following distance behind the vehicle ahead of you, use

- A) the two-second rule.
  - Why: A widely quoted figure, and the one older practice tests still give, but Ohio's manual does not use it.
- B) the five-second rule.
  - Why: More than the manual asks for, and hard to hold in traffic without being cut up.
- C) the one-second rule.
  - Why: One second leaves no room for perception and reaction, which together take about two.
- D) the four-second rule.
  - Why: Correct. Ohio's manual asks for one vehicle length per 10 mph, or four seconds behind the vehicle ahead.

**Answer:** D

### Q
Section: rules
Difficulty: hard
On a one-way street, you may park your vehicle parallel to and not more than __________ from the right or left curb.

- A) 15 inches
  - Why: Close, but Ohio specifies 12 inches.
- B) 25 inches
  - Why: Far enough from the curb to intrude into the travel lane.
- C) 18 inches
  - Why: A common guess, but wider than Ohio allows.
- D) 12 inches
  - Why: Correct. Park within 12 inches of the curb. On a one-way street either curb may be used.

**Answer:** D

### Q
Section: rules
Difficulty: medium
It is illegal to drive with a blood alcohol concentration (BAC) of _______ or higher.

- A) 0.10%
  - Why: An older national standard, since lowered. Ohio uses 0.08%.
- B) 0.06%
  - Why: Below Ohio's adult threshold, though drivers under 21 face a stricter 0.02% limit.
- C) 0.12%
  - Why: Well above the legal threshold. You are impaired long before this.
- D) 0.08%
  - Why: Correct. 0.08% is the limit for drivers 21 and over in Ohio.

**Answer:** D

### Q
Section: rules
Difficulty: hard
Which of the following statements about Ohio's speed limits is true?

- A) The speed limit in urban alleys is 35 mph except where otherwise posted.
  - Why: Alleys carry a much lower limit. 35 mph in an alley would be reckless.
- B) The maximum speed limit on freeways within municipal corporations is 75 mph.
  - Why: Ohio's top limit is 70 mph on rural interstates, and freeways inside municipalities are lower still.
- C) Outside business districts, the speed limit on urban state routes other than controlled-access highways is 35 mph except where otherwise posted.
  - Why: Correct. This is Ohio's stated default for that specific road type.
- D) Under adverse conditions, you should drive at the posted speed limit.
  - Why: The posted limit assumes ideal conditions. In rain, snow, or fog the safe speed is lower, and driving the limit anyway can still be a violation.

**Answer:** C

### Q
Section: rules
Difficulty: medium
If you want to make a turn, you must start to signal at least ________ before you turn.

- A) 50 feet
  - Why: Too short to give following drivers useful warning.
- B) 70 feet
  - Why: Not a distance Ohio uses for signalling.
- C) 100 feet
  - Why: Correct. Signal at least 100 feet before the turn.
- D) 80 feet
  - Why: Close to the real figure but not the one Ohio states.

**Answer:** C

### Q
Section: rules
Difficulty: hard
If your vehicle stalls on railroad tracks when a train is approaching, what should you do?

- A) Try to restart your vehicle.
  - Why: There is no time. A vehicle is replaceable and the train cannot stop for you.
- B) Turn on your flashers and try to warn the train.
  - Why: A loaded freight train needs more than a mile to stop. Warning it does not save you.
- C) Get everyone out of the vehicle.
  - Why: Correct. Everyone leaves immediately and moves away from the tracks, walking toward the train at an angle so debris is thrown behind you.
- D) Call 911 and wait for emergency assistance.
  - Why: Waiting inside the vehicle is the most dangerous option available. Get out first, call afterwards.

**Answer:** C

### Q
Section: rules
Difficulty: medium
On a freeway, you can avoid highway hypnosis by

- A) listening to very loud music.
  - Why: Volume does not restore attention and can mask sirens and horns.
- B) changing lanes frequently.
  - Why: This creates risk for everyone around you rather than keeping you alert.
- C) talking on your cell phone.
  - Why: Phone use is a distraction, and Ohio's hands-free law makes handheld use a primary offense.
- D) shifting your eyes from one area of the roadway to another.
  - Why: Correct. Highway hypnosis comes from a fixed stare. Keeping your eyes moving across mirrors, shoulders, and the road ahead prevents it.

**Answer:** D

### Q
Section: signs
Difficulty: easy
A double solid yellow centerline means that

- A) passing is permitted anytime.
  - Why: Solid lines are prohibitions. Passing is never permitted across a double solid yellow.
- B) passing is permitted at night.
  - Why: Pavement markings do not change meaning by time of day.
- C) passing is never permitted.
  - Why: Correct. Neither direction may pass across a double solid yellow centerline.
- D) passing is permitted during the day.
  - Why: Same error as the night option. The marking is absolute.

**Answer:** C

### Q
Section: rules
Difficulty: easy
Before entering an intersection, you must watch for

- A) crossing pedestrians.
  - Why: True, but incomplete on its own.
- B) vehicles approaching from the right.
  - Why: True, but incomplete on its own.
- C) vehicles approaching from the left.
  - Why: True, but incomplete on its own.
- D) all of the above.
  - Why: Correct. An intersection requires checking both directions and the crosswalk before you commit.

**Answer:** D

### Q
Section: rules
Difficulty: medium
Because of their size, trucks and buses may move _________ to make a right turn.

- A) onto the shoulder
  - Why: Long vehicles swing left before turning right, not onto the right shoulder.
- B) into the left lane
  - Why: Correct. A long vehicle needs to swing left first so its trailer clears the corner. Never try to squeeze up its right side.
- C) into the right lane
  - Why: Staying tight right is what the truck cannot do, which is exactly why the manoeuvre looks odd.
- D) beyond the intersection
  - Why: Driving past and reversing is not how a right turn is made.

**Answer:** B

### Q
Section: rules
Difficulty: medium
Vehicles approaching a roundabout must

- A) yield to the traffic in the roundabout.
  - Why: Correct. Traffic already circulating has right-of-way. Enter when there is a safe gap.
- B) enter the roundabout to the left of the central island.
  - Why: In the United States you enter to the right and travel counterclockwise.
- C) enter the roundabout at a speed of 35 mph.
  - Why: Roundabouts are designed for low speed, typically 15 to 20 mph.
- D) come to a complete stop and wait for traffic in the roundabout to clear.
  - Why: A roundabout is yield-controlled. Stopping when the way is clear causes rear-end collisions.

**Answer:** A

### Q
Section: rules
Difficulty: hard
If you suddenly have no control of the steering wheel, you should

- A) shift gears.
  - Why: Changing gear does nothing about lost steering.
- B) ease your foot off the gas pedal.
  - Why: Correct. Come off the accelerator gradually so the vehicle slows under control, then brake gently and pull off the road.
- C) apply the parking brake.
  - Why: A sudden parking brake at speed can lock the rear wheels and put you into a spin.
- D) ease your foot off the brake pedal.
  - Why: Releasing the brake does not help. Reducing power is what slows you safely.

**Answer:** B

### Q
Section: rules
Difficulty: medium
Headrests should be adjusted so that the head restraint contacts the back of the head. This prevents

- A) tightening of the seat belt during accidents.
  - Why: Head restraints have nothing to do with belt tension.
- B) bodily injuries in a head-on collision.
  - Why: Head restraints work against rearward head movement, which is a rear-impact problem.
- C) accidents from behind.
  - Why: A head restraint cannot prevent a collision. It reduces the injury one causes.
- D) neck injuries if you are hit from behind.
  - Why: Correct. A properly positioned restraint stops the head snapping backwards, which is what causes whiplash.

**Answer:** D

### Q
Section: signs
Difficulty: hard
A center lane that is marked on each side by a solid yellow line and a broken yellow line may be used by vehicles traveling in either direction to

- A) pass.
  - Why: A shared center turn lane is never a passing lane.
- B) back up.
  - Why: Reversing in a shared center lane is never permitted.
- C) make left turns.
  - Why: Correct. This is a two-way left turn lane. Drivers from either direction use it to wait for a gap before turning left.
- D) make right turns.
  - Why: A right turn is made from the right lane, not from the center of the road.

**Answer:** C

### Q
Section: rules
Difficulty: easy
The primary traveling aids for a blind person include

- A) a white cane or a trained guide dog.
  - Why: Correct. Yield the right-of-way to anyone using a white cane or a guide dog.
- B) a white cane or a wheelchair.
  - Why: A wheelchair is a mobility aid, not an aid for blindness.
- C) a red cane or a trained guide cat.
  - Why: The cane is white, and guide animals are dogs.
- D) a red cane or a trained guide dog.
  - Why: The guide dog is right but the cane is white, which is what makes it recognizable at a distance.

**Answer:** A

### Q
Section: rules
Difficulty: hard
You may not pass another vehicle EXCEPT

- A) when you are within 100 feet of a railroad crossing.
  - Why: Passing is prohibited approaching a railroad crossing.
- B) when there is a broken line next to your lane.
  - Why: Correct. A broken line on your side is the marking that permits passing when the way ahead is clear.
- C) on the right shoulder of the roadway.
  - Why: The shoulder is not a travel lane and passing on it is prohibited.
- D) when there is a school bus with flashing lights on the same roadway.
  - Why: A stopped school bus with red lights flashing requires a stop, never a pass.

**Answer:** B

### Q
Section: rules
Difficulty: hard
Which of the following statements about school zones is FALSE?

- A) The speed limit is 20 mph when children are going to or coming from school.
  - Why: True. This is Ohio's school zone limit.
- B) You don't have to yield to pedestrians in a school crosswalk that lacks a school crossing guard.
  - Why: Correct, this is the false statement. You must yield to pedestrians in a school crosswalk whether or not a guard is present.
- C) In a school zone, you must reduce your speed to the posted speed limit.
  - Why: True. The posted school zone limit applies during its stated hours.
- D) You should be aware that children have minimal perception of car speeds and distances.
  - Why: True, and the reason school zone limits are so low.

**Answer:** B

### Q
Section: rules
Difficulty: medium
To make a right turn from a four-lane divided highway, enter the right lane well in advance of the turn and make

- A) a tight turn into the right lane of the cross street.
  - Why: Correct. Stay close to the right edge and finish in the nearest right lane of the street you are entering.
- B) a wide turn into the right lane of the cross street.
  - Why: Swinging wide on a right turn invites a vehicle up your inside and is a truck manoeuvre, not a car one.
- C) a right turn at high speed.
  - Why: Speed is never part of a correct turning technique.
- D) a tight turn into the left lane of the cross street.
  - Why: A right turn ends in the nearest right lane, not across into the left one.

**Answer:** A

### Q
Section: signs
Difficulty: medium
Regulatory devices tell you

- A) to stop, proceed in a certain direction, or limit your speed.
  - Why: Correct. Regulatory signs and signals state the law: stop signs, speed limits, one-way arrows, turn restrictions.
- B) how to find your way safely or make your trip more comfortable.
  - Why: That describes guide and service signs, which are green and blue.
- C) of hazardous conditions or the possibility of hazardous conditions.
  - Why: That describes warning signs, which are yellow or orange.
- D) none of the above.
  - Why: The first option is a correct description of regulatory devices.

**Answer:** A

## Sign-Appearance Questions

The format where a sign is shown on screen and she has to say what it means. These are the
style target for every question that carries a `Sign:` line.

Two things make this format work, and both are easy to lose:

- **The stem is short.** "What does this sign mean?" — five words. Do not describe the
  sign, do not name it, do not add scenario padding. She is looking straight at it.
- **The distractors are near-misses from the same visual family.** A curve warning is
  wrong-answered with a sharp-turn warning, not with something about parking. The
  difficulty comes from telling apart signs that resemble each other.

The `Sign:` line names an id from `lib/signs.ts`, and the app draws that sign above the
question. Run `npm run signs` to see the full list of ids.

### Q
Section: signs
Difficulty: medium
Sign: curve-right
What does this sign indicate?

- A) Keep right ahead.
  - Why: A keep-right sign is a black-and-white regulatory marker at an obstruction, not a yellow warning diamond.
- B) A curve to the right is ahead.
  - Why: Correct. The arrow bends gradually, which marks a curve you can take at close to normal speed.
- C) A sharp right turn is ahead.
  - Why: A sharp turn is drawn as a right angle, not a gradual bend, and calls for a much lower speed.
- D) Only right turns are allowed ahead.
  - Why: That would be a white regulatory sign. A yellow diamond warns, it does not restrict.

**Answer:** B

### Q
Section: signs
Difficulty: hard
Sign: turn-right
What does this sign indicate?

- A) Keep right ahead.
  - Why: A keep-right sign is a black-and-white regulatory marker, not a yellow warning diamond.
- B) A curve to the right is ahead.
  - Why: A curve is drawn as a gradual bend. This arrow turns at a hard angle, which is the sharper hazard.
- C) A sharp right turn is ahead.
  - Why: Correct. The right-angle arrow marks a turn that must be taken well below the posted speed.
- D) Only right turns are allowed ahead.
  - Why: That would be a white regulatory sign. A yellow diamond warns, it does not restrict.

**Answer:** C

### Q
Section: signs
Difficulty: medium
Sign: no-left-turn
What does this sign mean?

- A) Right turns are prohibited.
  - Why: The arrow under the slash points left. The same sign with a right-pointing arrow bans right turns.
- B) The left lane is closed ahead.
  - Why: A lane closure is an orange work-zone sign showing lanes merging, not a red circle and slash.
- C) Left turns are prohibited.
  - Why: Correct. A red circle and slash over a left-turning arrow forbids that movement at this intersection.
- D) The right lane is closed ahead.
  - Why: A lane closure is an orange work-zone sign, and this one says nothing about lanes.

**Answer:** C

### Q
Section: signs
Difficulty: easy
Sign: safety-belt-symbol
What does this sign indicate?

- A) Do not use a cell phone while you are driving.
  - Why: Distracted-driving signs show a phone, usually struck through. This figure is wearing a belt.
- B) Wear your safety belt.
  - Why: Correct. The seated figure with a diagonal strap across the chest is the safety belt reminder, and the band below marks it as state law.
- C) Use a cell phone while you are driving.
  - Why: No traffic sign instructs a driver to use a phone, and Ohio's hands-free law forbids handheld use.
- D) Do not exceed the speed limit.
  - Why: Speed limits are given as a number on a white rectangle, never as a figure.

**Answer:** B

### Q
Section: signs
Difficulty: medium
Sign: no-u-turn
What does this sign mean?

- A) U-turns are prohibited.
  - Why: Correct. A red circle and slash over an arrow doubling back forbids turning around here.
- B) A sharp left turn is ahead.
  - Why: A turn warning is a yellow diamond. A red circle and slash always means a movement is banned.
- C) The road ahead loops back.
  - Why: No sign uses a circle and slash to describe the road's shape. That marking is always a prohibition.
- D) Left turns are prohibited.
  - Why: The arrow doubles all the way back on itself. A left-turn ban shows an arrow bending once.

**Answer:** A

### Q
Section: signs
Difficulty: hard
Sign: railroad-advance
What does this sign indicate?

- A) A railroad crossing is ahead.
  - Why: Correct. The round yellow sign with a large X and two letters warns of tracks ahead, so be ready to stop.
- B) You are at the tracks and must stop.
  - Why: The sign at the tracks themselves is the white X-shaped crossbuck. This one is a warning placed in advance.
- C) A crossroad is ahead.
  - Why: A crossroad warning is a yellow diamond with a plus symbol, not a round sign.
- D) The road ahead is closed.
  - Why: Road closures use signs and barricades, never a round yellow warning.

**Answer:** A

## Add yours below

Paste additional questions here in the format above. Aim for a rough 50/50 split between
`signs` and `rules` so both halves of the test have enough material to draw on.
