class RandomValue {
  constructor() {
    this.angle = randrange(1, 180); // 0-180
    this.line = randint(1, 20); // 0-20

    this.greater0 = randint(1, 15); // 1-15

    let multiplier = randint(1, 5);
    this.pyTriple = choice(
      [[3, 4, 5], [5, 12, 13], [7, 4, 25], [8, 15, 17], [9, 40, 41], [11, 60, 61], [12, 35, 37], [16, 63, 65], [20, 21, 2]]
    ).map(v => v * multiplier);  // pythagorean triple

    let t1 = randrange(1, 179);
    let t2 = randrange(1, 180 - t1);
    this.triangle = (t1, t2, 180 - t1 - t2);

    let tempTriangle = [randint(1, 15), randint(1, 15), randint(1, 15)];
    if (tempTriangle[0] + tempTriangle[1] <= tempTriangle[2] || tempTriangle[0] + tempTriangle[2] <= tempTriangle[1] || tempTriangle[1] + tempTriangle[2] <= tempTriangle[0])
      this.illegalTriangle = tempTriangle.concat(["not triangle"]);
    else {
      let modifiedTriangle = structuredClone(tempTriangle);
      let hyp2 = Math.pow(Math.max(...modifiedTriangle), 2);

      modifiedTriangle = modifiedTriangle.splice(modifiedTriangle.indexOf(Math.max(...modifiedTriangle)), 1);

      let l1 = Math.pow(modifiedTriangle[0], 2);
      let l2 = Math.pow(modifiedTriangle[1], 2);

      if (l1 + l2 < hyp2)
        this.illegalTriangle = tempTriangle.concat(["obtuse"]);
      else if (l1 + l2 == hyp2)
        this.illegalTriangle = tempTriangle.concat(["right"]);
      else if (l1 + l2 > hyp2)
        this.illegalTriangle = tempTriangle.concat(["acute"]);
      else
        this.illegalTriangle = tempTriangle.concat(["not triangle"]);
    }

    this.polygon = randint(3, 13); // 3-13

    this.boolean = randint(1, 2) == 1;

    this.corollary = randint(0, 1);
    this.corollaries2 = randint(0, 2);
    this.corollaries3 = randint(0, 3);
    this.corollaries4 = randint(0, 4);

    this.threeChoices = (this.greater0 - 1); // 5
  }
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const postulates = [
  (a, b, c) => null, // ruler postulate
  (a, b, c) => [`If mAB = ${a.line} and mBC = ${b.line}, what is mAC?`, a.line + b.line, 1], // segment addition
  (a, b, c) => null, // protractor postulate
  (a, b, c) => [`If m<AOB = ${a.angle} and m<BOC = ${b.angle}, what is m<AOC?`, a.angle + b.angle, 1], // angle addition postulate
  (a, b, c) => null, // postulate 5
  (a, b, c) => [`Through ${a.greater0 + 1} points, where no 3 are collinear, how many lines are there?`, a.greater0 * (a.greater0 + 1) / 2, 1],
  (a, b, c) => [`Through ${a.greater0 + 2} points, where no 3 are collinear and no 4 are coplanar, how many planes are there?`, a.greater0 * (a.greater0 + 1) * (a.greater0 + 2) / 6, 1],
  (a, b, c) => null, // postulate 8
  (a, b, c) => null, // postulate 9
  (a, b, c) => [`AB is parallel to CD and EF intersects both lines at G and H, respectively. If m<AGE = ${a.angle}, what is m<CHG?`, a.angle, 3],
  (a, b, c) => [`Triangle ABC has side lengths ${a.line}, ${b.line}, and ${c.line}. Triangle DEF has the same side lengths. What postulate can be used to prove them congruent?`, "SSS", 4], // SSS postulate
  (a, b, c) => [`Triangle ABC has side lengths ${a.pyTriple[0]}, ${a.pyTriple[1]}, and ${a.pyTriple[2]}. Triangle DEF has sides ${a.pyTriple[0]}, ${a.pyTriple[2]}, and a right angle opposite of ${Math.max(...a.pyTriple)}. What postulate can be used to prove them congruent without finding a third side?`, "SAS", 4], // SAS postulate
  (a, b, c) => [`Triangle ABC is isosceles and the length of the base, BC, is ${a.line}. Triangle BCD is also isosceles and has the same base. If m<ABC = m<BCD, what postulate can be used to prove them congruent?`, "ASA", 4], // ASA postulate
  (a, b, c) => [`In triangles ABC and DEF, if m<ABC = m<DEF and m<BCA = m<EFD, what postulate can be used to prove them similar?`, "AA Similarity", 7], // AA similarity postulate
  (a, b, c) => [`Points A, B, and C are on circle O. If the measure of arc AB is ${a.angle} degrees and the measure of arc BC is ${b.angle} degrees, what is the measure of arc AC?`, a.angle + b.angle, 9], // arc addition postulate
  (a, b, c) => [`If a square has side length ${a.line}, what is its area?`, a.line ** 2, 11],
  (a, b, c) => [`Polygons ${alphabet.slice(0, a.polygon).join("")} and ${alphabet.slice(a.polygon, a.polygon + b.polygon).join("")} have the same area. Are they congruent? [y/n]`, a.polygon == b.polygon ? "y" : "n", 11], // area congruence postulate
  (a, b, c) => [`Polygon ${alphabet.slice(a.polygon).join("")} is split into two. One part has area ${a.greater0}, and the other has area ${b.greater0}. What is the total area of the polygon?`, a.greater0 + b.greater0, 11] // area addition postulate
].filter(v => v(new RandomValue(), new RandomValue(), new RandomValue()) != null);

const postulateChapters = [...new Set(postulates.map(v => v(new RandomValue(), new RandomValue(), new RandomValue())[2]))];

const theorems = [
  [
    (a, b) => [`Lines AB and CD intersect in how many points?`, 1],
    (a, b) => [`Through line AB and point C, where C is not on AB, how many planes are there?`, 1],
    (a, b) => [`Lines AB and CD intersect. How many planes contain both lines?`, 1]
  ], // points, lines, planes & angles
  [
    (a, b) => [`M is the midpoint of AB. If AM = xAB, what is x?`, 0.5], // midpoint theorem
    (a, b) => [`Ray BX bisects <ABC. If m<ABX = xm<ABC, what is x?`, 0.5], // angle bisector theorem
    (a, b) => [`Lines AB and CD intersect at E. Are <AED and <CEB congruent? [y/n]`, "y"],
    (a, b) => [`Line AB is the perpendicular bisector of segment CD, and the midpoint of CD is E. How many pairs of congruent adjacent angles are formed?`, 4],
    (a, b) => [`Line AB bisects segment CD at E. If <AEC and <AED are congruent and adjacent, is AB perpendicular to CD? [y/n]`, "y"],
    (a, b) => [`If the exterior sides of two adjacent angles are perpendicular, are the angles complementary? [y/n]`, "y"],
    (a, b) => [`Two angles are supplements of congruent angles. Are they congruent? [y/n]`, "y"],
    (a, b) => [`Two angles are complements of congruent angles. Are they congruent? [y/n]`, "y"]
  ], // deductive reasoning
  [
    (a, b) => [`If two parallel planes are cut by a third plane, are the lines of intersection also parallel? [y/n]`, "y"],
    (a, b) => [`Parallel lines AB and CD are cut by a transversal EF, which intersects the lines at G and H, respectively. Are <AGD and <FHG congruent, complementary, supplementary, or none of the above?`, "congruent"],
    (a, b) => [`Parallel lines AB and CD are cut by a transversal EF, which intersects the lines at G and H, respectively. Are <AGD and <EHG congruent, complementary, supplementary, or none of the above?`, "supplementary"],
    (a, b) => [`Parallel ines AB and CD are cut by a transversal EF. If EF is perpendicular to AB, is it also perpendicular to CD? [y/n]`, "y"],
    (a, b) => [`Lines AB and CD are cut by a transversal EF, which intersects the lines at G and H, respectively. If <AGD and <EHG are congruent, are AB and CD parallel, perpendicular, or intersecting?`, "parallel"],
    (a, b) => [`Lines AB and CD are cut by a transversal EF, which intersects the lines at G and H, respectively. If <AGD and <EHG are supplementary, are AB and CD parallel, perpendicular, or intersecting?`, "parallel"],
    (a, b) => [`Lines AB and CD are both perpendicular to line EF. Are AB and CD parallel, perpendicular, or intersecting?`, "parallel"],
    (a, b) => null,
    (a, b) => null,
    (a, b) => [`Lines AB and CD are both parallel to line EF. Are AB and CD parallel, perpendicular, or intersecting?`, "parallel"],
    (a, b) => a.corollaries4 == 0 ? [`Triangle ABC has angles ${a.triangle[0]}, ${a.triangle[1]}, and x. What is x?`, a.triangle[2]]
      : (a.corollaries4 == 1 ? [`Triangle ABC has angles a, b, and c. Triangle DEF has angles x, y, and z. If a = x and c = z, does b = y? [y/n]`, "y"]
        : (a.corollaries4 == 2 ? [`Triangle ABC is equilateral. What is m<ABC?`, 60]
          : (a.corollaries4 == 3 ? [`Triangle ABC is ${a.threeChoices == 0 ? 'right' : (a.threeChoices == 1 ? 'obtuse' : 'acute')}. Can there be any other right or obtuse angles? [y/n]`, a.threeChoices == 2 ? "y" : "n"]
            : [`Triangle ABC is right. Are the other two angles congruent, supplementary, complementary, or none of the above?`, "complementary"]))),
    (a, b) => [`Base AC of triangle ABC is extended to point D such that C is on AD. Is m<BCD the sum, difference, product, quotient, or average of m<BAC and m<ABC?`, "sum"],
    (a, b) => [`What is the sum of the measures of the interior angles in convex polygon ${alphabet.slice(0, a.polygon).join("")}?`, (a.polygon - 2) * 180],
    (a, b) => [`What is the sum of the measures of the exterior angles in convex polygon ${alphabet.slice(0, a.polygon).join("")}?`, 360]
  ], // parallel lines and planes
  [
    (a, b) => a.corollaries3 == 0 ? [`Triangle ABC has two congruent sides. Are the angles opposite those sides congruent, supplementary, complementary, or none of the above?`, "congruent"]
      : (a.corollaries3 == 1 ? [`Triangle ABC is equilateral. Is it also equiangular? [y/n]`, "y"]
        : (a.corollaries3 == 2 ? [`Triangle ABC is equilateral. What is the measure of one of its angles?`, 60]
          : [`Line EF bisects vertex angle <ABC in isosceles triangle ABC. Is EF a non-perpendicular bisector, the perpendicular bisector, the angle bisector, or a parallel of the base?`, "perpendicular bisector"])),  // isosceles triangle theorem
    (a, b) => a.corollary ? [`Triangle ABC has two congruent angles. Are the sides opposite those angles congruent? [y/n]`, "y"]
      : [`Triangle ABC is equiangular. Is it also equilateral? [y/n]`, "y"],
    (a, b) => [`Triangles ABC and DEF have two pairs of corresponding congruent angles. For one pair of corresponding angles, the sides opposite of them are also congruent. What theorem can be used to prove ABC and DEF congruent?`, "AAS"], // aas theorem
    (a, b) => [`Right triangles ABC and DEF have right angles and B and E, respectively. If AC is congruent to DF and AB is congruent to DE, what theorem can be used to prove ABC and DEF congruent?`, "HL"], // hl theorem
    (a, b) => [`Point X lies on perpendicular bisector CD of segment AB. Is triangle AXB isosceles? [y/n]`, "y"],
    (a, b) => [`Point X lies on line CD, which intersects segment AB. If X is equidistant from A and B, is CD the perpendicular bisector of AB? [y/n]`, "y"],
    (a, b) => [`Point X lies on angle bisector DE of angle <ABC. Is X equidistant from A and C? [y/n]`, "y"],
    (a, b) => [`Point X lies on line DE, which is inside angle <ABC. If triangle AXC is isosceles, does DE bisect <ABC? [y/n]`, "y"]
  ], // congruent triangles
  [
    (a, b) => [`In parallelogram ABCD, is AB congruent to CD?`, "y"],
    (a, b) => [`In parallelogram ABCD, is <ABC congruent to <ADC?`, "y"],
    (a, b) => [`In parallelogram ABCD, do AC and BD bisect each other?`, "y"],
    (a, b) => [`In polygon ACBE, AE is congruent BC and AC is congruent to BE. Is ACBE a triangle, quadrilateral, parallelogram, rhombus, rectangle, or square? Be as specific as possible in the general case.`, "parallelogram"],
    (a, b) => [`In quadrilateral ABCD, AB is congruent and parallel to CD. Is ACBE a quadrilateral, parallelogram, rhombus, rectangle, or square? Be as specific as possible in the general case.`, "parallelogram"],
    (a, b) => [`In quadrilateral ABCD, <ABC is congruent to <ADC and <ADC is congruent to <BCD. Is ACBE a quadrilateral, parallelogram, rhombus, rectangle, or square? Be as specific as possible in the general case.`, "parallelogram"],
    (a, b) => [`In quadrilateral ABCD, AC bisects BD. Is ACBE a quadrilateral, parallelogram, rhombus, rectangle, or square? Be as specific as possible in the general case.`, "parallelogram"],
    (a, b) => [`Lines AB and CD are parallel. Are all points on AB equidistant from CD?`, "y"],
    (a, b) => [`Parallel lines KE, FC, and PO cut off congruent segments from transversal GH. If transversal IZ also cuts the three parallels, are the finite parts of IZ also split into congruent segments like GH?`, "y"],
    (a, b) => [`In triangle ABC, line EF passes through the midpoint of AB and is parallel to BC. Does EF pass through the midpoint of AC?`, "y"],
    (a, b) => a.corollary == 0 ? [`In triangle ABC, line EF passes through the midpoints of AB and AC. Is EF parallel to BC?`, "y"]
      : [`In triangle ABC, line EF passes through the midpoints of AB and AC. If mEF = xmBC, what is X?`, "0.5"],
    (a, b) => [`In rectangle ABCD, is AC congruent to BD?`, "y"],
    (a, b) => [`In rhombus ABCD, are AC and BD parallel, perpendicular, or intersecting?`, "perpendicular"],
    (a, b) => [`In rhombus ABCD do AC and BD bisect <BAC and <BDC, respectively?`, "y"],
    (a, b) => [`In right triangle ABC, with the right angle at B and M as the midpoint of AC, is M equidistant from A, B, and C?`, "y"],
    (a, b) => [`In parallelogram ABCD, <ABC is right. Is ABCD a rectangle, square, rhombus, parallelogram, or square? Be as specific as possible in the general case.`, "rectangle"],
    (a, b) => [`In parallelogram ABCD, AB is congruent to BC. Is ABCD a rectangle, square, rhombus, parallelogram, or square? Be as specific as possible in the general case.`, "rhombus"],
  ], // quadrilaterals
  [
    (a, b) => [`In triangle ABC, base BC is extended to D such that C is on BD. Is m<ABD greater than, less than, or equal to ${a.boolean ? 'm<ACB' : 'm<ABC'}? [<,>,=]`, ">"], // the exterior angle inequality theorem
    (a, b) => [`In triangle ABC, AB is longer than BC. Is m<ACB greater than, less than, or equal to m<BAC? [<,>,=]`, ">"],
    (a, b) => a.corollary == 0 ? [`In triangle ABC, m<ACB is greater than m<BAC. Is mAB greater than, less than, or equal to mBC? [<,>,=]`, ">"]
      : [`Is the perpendicular segment from a point to a ${a.boolean ? 'line' : 'plane'} the shortest possible?`, "y"],
    (a, b) => [`In triangle ABC, is mAB + mBC greater than, less than, or equal to mAC? [<,>,=]`, ">"], // the triangle inequality
    (a, b) => [`In triangles ABC and DEF, AB is congruent to DE, BC is congruent to EF, and <ABC is larger than <DEF. Is AC longer, shorter, or congruent to DF? [<,>,=]`, ">"], // SAS inequality theorem
    (a, b) => [`In triangles ABC and DEF, AB is congruent to DE, BC is congruent to EF, and AC is longer than DF. Is m<ABC greater than, less than, or congruent to m<DEF? [<,>,=]`, ">"] // SAS inequality theorem
  ], // inequalities in geometry
  [
    (a, b) => [`In triangles ABC and DEF, <ABC is congruent to <DEF, AB is proportional to DE, and BC is proportional to EF. What theorem can be used to prove them similar?`, "SAS Similarity"], // SAS similarity theorem
    (a, b) => [`In triangles ABC and DEF, all sides are in proportion. What theorem can be used to prove them similar?`, "SSS Similarity"], // SSS similarity
    (a, b) => a.corollary == 0 ? [`In triangle ABC, line EF is parallel to AB and intersects BC and AC. Does it divide BC and AC into congruent sides, proportional sides, or neither? Be as specific as possible in the general case.`, "proportional"]
      : [`Parallel lines AB, CD, and EF cut transversals GH and IJ. Do the parallels divide the transversals into congruent segments, proportional segments, or neither? Be as specific as possible in the general case.`, "proportional"], // triangle proportionality theorem
    (a, b) => [`Ray DE bisects <ABC in triangle ABC. Does it divide AC into segments congruent, proportional, or unrelated to AB and BC? Be as specific as possible in the general case.`, "proportional"] // triangle angle-bisector theorem
  ], // similar polygons
  [
    (a, b) => a.corollaries2 == 0 ? [`In right triangle ABC, an altitude is drawn from base BC to hypotenuse AC. Are the formed triangles congruent, similar or unrelated to ABC? Be as specific as possible in the general case.`, "similar"]
      : (a.corollaries2 == 1 ? [`In right triangle ABC, an altitude is drawn from base BC to hypotenuse AC. Is the length of the altitude the geometric mean, arithmetic mean, or unrelated to the segments created by the altitude dividing the hypotenuse? Be as specific as possible in the general case.`, "geometric mean"]
        : [`In right triangle ABC, an altitude is drawn from base BC to hypotenuse AC. Are the legs the geometric mean, arithmetic mean, or unrelated to the hypotenuse and the segment of the hypotenuse adjacent to the leg? Be as specific as possible in the general case.`, "geometric mean"]),
    (a, b) => a.boolean ? [`In right triangle ABC the legs are ${a.pyTriple[0]} and ${a.pyTriple[1]}. What is the hypotenuse?`, a.pyTriple[2]]
      : [`In right triangle ABC one leg is length ${a.pyTriple[0]} and the hypotenuse is length ${a.pyTriple[2]}. What is the length of the unknown leg?`, a.pyTriple[1]], // pythagorean theorem
    (a, b) => [`In triangle ABC, the length of the sides are ${a.illegalTriangle[0]}, ${a.illegalTriangle[1]}, and ${a.illegalTriangle[2]}. Is ABC right, acute, obtuse, or not a triangle at all? [right, acute, obtuse, not triangle]`, a.illegalTriangle[3]], // 8-3, 8-4, 8-5, 6-4
    (a, b) => [`In 45-45-90 triangle ABC, the hypotenuse is sqrt(x) times as long as a leg. What is x?`, 2], // 45-45-90 theorem
    (a, b) => [`In 30-60-90 triangle ABC, the side opposite the 30 degree angle is length x. The side opposite the 60 degree angle is length sqrt(b) * x. The side opposite the 90 degree angle is length sqrt(c) * x. What is bc?`, 12], // 30-60-90 theorem
  ], // right triangles
  [
    (a, b) => a.corollary == 0 ? [`Line AB is drawn tangent to a circle. Is the line drawn from the center of the circle to the line perpendicular to AB?`, "y"]
      : [`There are ten tangent segments to circle O that all intersect point C not on or in circle O. An arbitrary segment is chosen with length x. How many other segments also have length x?`, 9],
    (a, b) => [`Line AB is perpendicular to radius OC of circle O at C. Is AB a tangent, secant, or neither of O?`, "tangent"],
    (a, b) => [`Minor arcs AB and CD have congruent central angles and are in congruent circles. Are they the same length?`, "y"],
    (a, b) => [`Minor ${a.boolean ? 'arcs' : 'chords'} AB and CD are in congruent circles. Are their respective ${a.boolean ? 'chords' : 'arcs'} congruent?`, "y"],
    (a, b) => [`Diameter AB of circle O bisects chord CD and its arc. Is AB a perpendicular, parallel, or intersecting line of chord CD? Be as specific as possible in the general case.`, "perpendicular"],
    (a, b) => a.boolean ? [`Chords AB and CD are equidistant from the centers of their respective congruent circles. Are AB and CD congruent?`, "y"]
      : [`Chords AB and CD are congruent. Are they equidistant from the centers of their respective congruent circles?`, "y"],
    (a, b) => a.corollaries3 == 0 ? [`An inscribed angle has measure ${a.angle}. What is the measure of its intercepted arc?`, a.angle * 2]
      : (a.corollaries3 == 1 ? [`Inscribed angles A and B intercept the same arc. Are they congruent?`, "y"]
        : (a.corollaries3 == 2 ? [`An angle is inscribed in a semicircle. Is it right?`, "y"]
          : [`Quadrilateral ABCD is inscribed in a circle. Are <ABC and <ADC supplementary, complementary, or neither?`, "supplementary"])),
    (a, b) => [`A chord and tangent form an angle with measure ${a.angle}. What is the measure of the intercepted arc?`, a.angle * 2],
    (a, b) => [`Two chords intersect. The intercepted arcs of a certain angle formed by those chords measure ${a.angle} and ${b.angle}. What is the measure of that angle? Round down.`, Math.floor((a.angle + b.angle) / 2)],
    (a, b) => [`${a.boolean ? 'Two secants' : (b.boolean ? 'Two chords' : 'A secant and a chord')} intersect outside of a circle. The intercepted arcs of a certain angle formed by those chords measure ${a.angle} and ${b.angle}. What is the measure of that angle? Round down.`, Math.floor(Math.abs(a.angle - b.angle) / 2)],
    (a, b) => [`Two chords of a circle intersect in it. If the product of the segments of one chord is ${a.greater0}, what is the product of the segments of the other chord?`, a.greater0],
    (a, b) => [`Two secants of a circle are drawn from a point outside of it. If the product of one secant and its external segment is ${a.greater0}, what is the product of the other and its external segment?`, a.greater0],
    (a, b) => [`A secant and a tangent of a circle  are drawn from a point outside of it. If the square of the length of the tangent is ${a.greater0}, what is the product of the secant segment and its external segment?`, a.greater0]
  ], // circles
  // constructions and loci
  // areas of plane figures
  // areas and volumes of solids
  // coordinate geometry
  // transformations
];

var hardQuestionAdvancement = 0;
const hardQuestions = [
  ["Let n be a positive integer. A Japanese triangle consists of 1 + 2 + ... + n circles arranged in an equilateral triangular shape such that for each i = 1, 2, ..., n, the ith row contains exactly i circles, exactly one of which is coloured red. A ninja path in a Japanese triangle is a sequence of n circles obtained by starting in the top row, then repeatedly going from a circle to one of the two circles immediately below it and finishing in the bottom row. In terms of n, find the greatest k such that in each Japanese triangle there is a ninja path containing at least k red circles. Valid functions: floor(), ceil(), round(). Add spaces between operations.", "floor(n + 1) / 2"],
  ["Turbo the snail plays a game on a board with 2024 rows and 2023 columns. There are hidden monsters in 2022 of the cells. Initially, Turbo does not know where any of the monsters are, but he knows that there is exactly one monster in each row except the first row and the last row, and that each column contains at most one monster. Turbo makes a series of attempts to go from the first row to the last row. On each attempt, he chooses to start on any cell in the first row, then repeatedly moves to an adjacent cell sharing a common side. (He is allowed to return to a previously visited cell.) If he reaches a cell with a monster, his attempt ends and he is transported back to the first row to start a new attempt. The monsters do not move, and Turbo remembers whether or not each cell he has visited contains a monster. If he reaches any cell in the last row, his attempt ends and the game is over. Determine the minimum value of n for which Turbo has a strategy that guarantees reaching the last row on the nth attempt or earlier, regardless of the locations of the monsters.", 3],
  ["Does P = NP?", "Yo i don't even know bro, don't ask me. Give up gang! Oh, your answer is 'correct'. <b>prove it.</b>"]
];

var validPostulates = [...postulates];
var validTheorems = [...theorems];

function log(text, append, type) {
  let fieldset = document.getElementById("questions");

  let element;
  if (!append) element = document.createElement('div');
  else element = fieldset.lastElementChild;

  let paragraph = document.createElement('p');
  if (hardQuestionAdvancement <= 0) paragraph.innerText = text;
  else paragraph.innerHTML = text;

  if (append) {
    element.appendChild(document.createElement('br'));
    element.classList.add("gray");
  } else element.classList.add(type ?? "normal")
  element.appendChild(paragraph);

  if (!append) fieldset.appendChild(element);
  fieldset.scrollTop = fieldset.scrollHeight;
}

function fixQuestion(question) {
  try {
    question[0] = question[0].trim().toString();
  } catch (e) {
    console.log(question);
    throw e;
  }

  let newQuestion = question;

  if (typeof (question[1]) == "string") {
    if ((question[1].toLowerCase() == "y" || question[1].toLowerCase() == "n") && (!question[0].endsWith("[y/n]")))
      newQuestion[0] = question[0].trimEnd() + " [y/n]" + (question[0].endsWith("\n") ? "\n" : "");
  } else {
    newQuestion[1] = parseFloat(question[1]);

    if (!isFinite(newQuestion[1])) {
      newQuestion[1] = parseInt(question[1]);

      if (!isFinite(newQuestion[1])) {
        newQuestion[1] = question[1].toString().toLowerCase();
      }
    }
  }

  return newQuestion
}

function submit() {
  let input = document.getElementById("input");
  let rawInput = input.value.trim().toLowerCase();
  if (rawInput.length == 0) return;

  if (!currentAnswer.toString().includes(" ")) rawInput = rawInput.replaceAll(/(?<=.*) .*/gi, "");
  if (currentAnswer.toString().toLowerCase().includes("similarity")) rawInput = rawInput.replaceAll("~", "similarity");
  if ('yn'.includes(currentAnswer.toString().toLowerCase())) rawInput = rawInput.trim()[0];

  input.value = "";

  let answer = parseFloat(rawInput);

  if (!isFinite(answer)) {
    answer = parseInt(rawInput);

    if (!isFinite(answer)) {
      if (rawInput.split("/").length == 2) {
        answer = parseFloat(rawInput.split('/')[0]) / parseFloat(rawInput.split('/')[1]);

        if (!isFinite(answer)) answer = rawInput;
      } else answer = rawInput;
    }
  }

  let correct = answer == (typeof (currentAnswer) == 'string' ? currentAnswer.toLowerCase() : currentAnswer);
  log(`${correct ? "Correct!" : "Incorrect."}${hardQuestionAdvancement <= 0 || hardQuestionAdvancement == 3 ? '\nAnswer: ' + currentAnswer : ''}`, true);

  if (hardQuestionAdvancement > 0) {
  } else if (isTheorem) {
    if (correct) {
      if (theoremWeights[chapter - 1] > 1) theoremWeights[chapter - 1] -= 0.25;
    } else if (theoremWeights[chapter - 1] < 5) theoremWeights[chapter - 1] += 0.5;

    for (let i = 1; i <= 9; i++) {
      document.querySelector(`label[for="theoremC${i}"] span.practiceLabel`).style.display = theoremWeights[i - 1] > 1.5 ? "inline-block" : "none";

      let inputElement = document.querySelector(`input[name="theoremC${i}"]`);
      inputElement.disabled = theoremWeights[i - 1] > 1.5;
      if (inputElement.disabled) inputElement.checked = true;
    }
  } else {
    let chapterIdx = postulateChapters.indexOf(chapter);

    if (correct) {
      if (postulateWeights[chapterIdx] > 1) postulateWeights[chapterIdx] -= 0.25;
    } else if (postulateWeights[chapterIdx] < 5) postulateWeights[chapterIdx] += 0.5;

    for (let i = 0; i < 6; i++) {
      document.querySelector(`label[for="postulateC${postulateChapters[i]}"] span.practiceLabel`).style.display = postulateWeights[i - 1] > 1.5 ? "inline-block" : "none";

      let inputElement = document.querySelector(`input[name="postulateC${postulateChapters[i]}"]`);
      inputElement.disabled = postulateWeights[i - 1] > 1.5;
      if (inputElement.disabled) inputElement.checked = true;
    }
  }

  let targetSpan = document.querySelector(`span#${correct ? "correct" : "incorrect"}`);
  targetSpan.innerHTML = parseInt(targetSpan.innerHTML) + 1;
  let correctQuestions = parseInt(document.querySelector("span#correct").innerHTML);

  targetSpan = document.querySelector(`span#total`);
  targetSpan.innerHTML = parseInt(targetSpan.innerHTML) + 1;
  let totalQuestions = parseInt(targetSpan.innerHTML);

  document.querySelector("p#accuracy").innerHTML = `Accuracy: ${totalQuestions == 0 ? 100 : Math.floor(correctQuestions / totalQuestions * 10000) / 100}%`;

  if (hardQuestionAdvancement > 0) {
    if ((!correct && hardQuestionAdvancement > 1) || hardQuestionAdvancement == 3) {
      if (hardQuestionAdvancement == 3) {
        document.getElementById("screen").style.animation = "2s ease-out forwards shade-slide";
        hardQuestionAdvancement += 1;

        let element = document.querySelector("div#screen > h1");
        element.innerHTML = "You have failed."
        window.setTimeout(() => element.style.animation = "3s linear forwards fade-in", 2500);
      } else {
        hardQuestionAdvancement -= 1;
        document.querySelectorAll("fieldset#questions div:not(:last-of-type)").forEach(e => e.remove());
      }
    } else if (correct) hardQuestionAdvancement += 1;

    if (hardQuestionAdvancement != 4) createQuestion(hardQuestions[hardQuestionAdvancement - 1]);
  } else createQuestion();
}

function randint(a, b) {
  return Math.floor((b - a + 1) * Math.random()) + a;
}

function randrange(a, b) {
  return randint(a, b - 1);
}

function choice(l) {
  return l[randint(0, l.length - 1)];
}

function weightedChoice(l, w) {
  let weight = i => w.slice(0, i).reduce((a, b) => a + b, 0);
  let fits = (n, i) => (i == 1 ? true : n > weight(i - 1)) && n <= weight(i); // indices 1-n

  let value = Math.random() * w.length;
  let index = [...Array(w.length).keys()].filter(v => fits(value, v + 1))[0];

  console.log(`${l.length} ${w} ${index}`);
  return [l[index], index];
}

function createQuestion(givenQ) {
  try {
    let question;

    if (givenQ == null || givenQ == undefined) {
      while (question == null) {
        let choiceNumber = randint(1, 2);
        if (validPostulates.length == 0) choiceNumber = 2;
        else if (validTheorems.length == 0) choiceNumber = 1;

        if (validPostulates.length == 0 && validTheorems.length == 0) {
          let interval = window.setInterval(() => {
            if (validPostulates.length + validTheorems.length > 0) {
              createQuestion();
              window.clearInterval(interval);
            }
          }, 100);
          return;
        }

        if (choiceNumber == 1) {
          let tempChapter = weightedChoice(postulateChapters, postulateWeights)[0];
          console.log(tempChapter);

          let qFunc = choice(validPostulates.filter((thing) => thing(new RandomValue(), new RandomValue(), new RandomValue())[2] == tempChapter));
          if (typeof qFunc != 'function') {
            console.log("error: not function: " + qFunc);
            continue;
          }

          question = qFunc(new RandomValue(), new RandomValue(), new RandomValue());
          if (question != null) {
            chapter = question[2];
            questionsSeen.add(qFunc);
          }
        } else {
          let theoremSet = weightedChoice(validTheorems, theoremWeights.filter((item, index) => !invalidTheoremIndices.includes(index) && index < 9));
          console.log(theoremSet);
          console.log(choice);

          let qFunc = choice(theoremSet[0]);
          if (typeof qFunc != 'function') {
            console.log("error: not function: " + qFunc);
            continue;
          }

          question = qFunc(new RandomValue(), new RandomValue());
          if (question != null) {
            chapter = theoremSet[1] + 1;
            questionsSeen.add(qFunc);
          }
        }

        isTheorem = choiceNumber != 1;
      }
    } else question = givenQ;

    question = fixQuestion(question);

    document.querySelector("p#seenQ").innerHTML = `You have seen ${questionsSeen.size}/111 questions.`;

    log(question[0] + (showChapter ? " (Chapter " + chapter + ")" : ""), false);
    currentAnswer = question[1];
  } catch (e) {
    log(e.toString(), false, 'error');
    throw e;
  }
}

function updateValidTheorems() {
  validPostulates = postulates.filter((item, index) => {
    let data = item(new RandomValue(), new RandomValue(), new RandomValue());
    if (data == null) return false;

    let input = document.querySelector(`input[name="postulateC${data[2]}"]`);
    if (input == undefined) return true;

    return input.checked;
  });

  invalidTheoremIndices = [...Array(9).keys()].filter((item, index) => document.querySelector(`input[name="theoremC${index + 1}"]`).checked);
  validTheorems = theorems.map((item, index) => [item, index + 1]).filter((item, index) => !invalidTheoremIndices.includes(index));

  console.log(validPostulates.length + " " + validTheorems.length);
}

// function notify(text) {
//   document.querySelector('div#notification > p').innerHTML = "<b>Notification</b><br />" + text;

//   let notification = document.querySelector('div#notification');
//   notification.style.animation = "3s ease-in forwards notify-slide";
// }

var currentAnswer = 0;
var isTheorem = false;
var chapter, showChapter;

var theoremWeights = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var postulateWeights = [1, 1, 1, 1, 1, 1];
var invalidTheoremIndices = [];

var questionsSeen = new Set();

document.addEventListener('DOMContentLoaded', event => {
  document.getElementById("input").addEventListener("keydown", event => {
    if (event.key == "Enter" || event.key == "Return") submit();
  });

  document.querySelectorAll("input.tpCheck").forEach(e => e.addEventListener("change", updateValidTheorems));
  document.querySelector("input[name=\"allowHints\"]").addEventListener("change", event => {
    let lastQuestion = document.querySelector("fieldset#questions div:last-of-type p");

    showChapter = document.querySelector("input[name=\"allowHints\"]").checked;
    if (showChapter) lastQuestion.innerHTML += " (Chapter " + chapter + ")";
    else lastQuestion.innerHTML = lastQuestion.innerHTML.split('(Chapter')[0].trim();
  });

  // document.addEventListener("mousemove", event => {
  //   if (event.y < 75) {
  //     document.querySelector("fieldset#topbar").style.display = "grid";
  //     document.querySelectorAll(".fillsTop").forEach(el => {
  //       el.classList.remove("fillsTop");
  //       el.classList.add("willFillTop");
  //     });
  //   } else {
  //     document.querySelector("fieldset#topbar").style.display = "none";
  //     document.querySelectorAll(".willFillTop").forEach(el => {
  //       el.classList.add("fillsTop");
  //       el.classList.remove("willFillTop");
  //     });
  //   }
  // });

  let hardmode = document.getElementById("killswitch");
  hardmode.addEventListener("change", event => {
    hardmode.disabled = true;
    hardmode.checked = true;
    showChapter = false;

    document.querySelectorAll("fieldset#options :not([class=\"hardmode\"]), fieldset#questions div").forEach(e => e.remove());
    document.getElementById("screen").style.animation = "2s ease-out forwards shade-slide";

    window.setTimeout(() => document.querySelector("div#screen > h1").style.animation = "3s linear forwards fade-in", 2500);
    window.setTimeout(() => document.querySelector("div#screen > h2").style.animation = "2s linear forwards fade-in", 5000);
    window.setTimeout(() => {
      document.querySelectorAll("div#screen, div#screen > h1, div#screen > h2").forEach(e => {
        e.style.opacity = "1";
        e.style.animation = "";
        window.setTimeout(() => e.style.animation = "2s linear forwards fade-out", 10);
      });
    }, 8000);
    window.setTimeout(() => {
      document.querySelectorAll("div#screen, div#screen > h1, div#screen > h2").forEach(e => e.style.opacity = "");

      hardQuestionAdvancement = 1;
      createQuestion(hardQuestions[0]);
    }, 10000);
  });

  createQuestion();
});