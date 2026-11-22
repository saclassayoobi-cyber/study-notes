import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { notes, subjects } from "@/db/schema";
import { slugify } from "@/lib/text";

type SeedNote = {
  subject: string;
  title: string;
  semester: string;
  summary: string;
  tags: string;
  body: string;
};

const seedNotes: SeedNote[] = [
  {
    subject: "Management",
    title: "Industrial Relations & Collective Bargaining",
    semester: "Semester 4",
    summary:
      "Core frameworks linking employer-employee dynamics, trade unions, dispute resolution, and wage agreements.",
    tags: "industrial relations, unions, arbitration",
    body: `## The scope of industrial relations
Industrial relations examines the structured interactions among workers, trade unions, employers, and state institutions within a labor market. It is less a single theory than a field of practice built around three actors and the rules that govern them.

## Collective bargaining
Collective bargaining serves as the primary mechanism for negotiating wages, working hours, grievance procedures, and workplace safety standards without resorting to prolonged strikes or lockouts.

- Preparation: each side compiles claims, costings, and comparable settlements
- Negotiation: proposals are exchanged and traded against priorities
- Agreement: terms are drafted, ratified, and written into the contract
- Administration: day-to-day interpretation and grievance handling

## Dispute settlement
Effective dispute settlement relies on clear communication channels, conciliation machinery, arbitration options, and adherence to statutory labor protections. Conciliation keeps the parties talking; arbitration transfers the decision to a neutral third party; adjudication places it with a labor court.

Remember the sequence: prevention, then conciliation, then arbitration, and only lastly industrial action.`,
  },
  {
    subject: "Political Thought",
    title: "Social Contract & General Will: Rousseau",
    semester: "Semester 5",
    summary:
      "Key ideas on civil freedom, legitimacy of political authority, and the distinction between particular and general will.",
    tags: "rousseau, legitimacy, freedom",
    body: `## Why the contract matters
Jean-Jacques Rousseau argues that legitimate political authority arises from a social contract in which individuals unite while preserving personal moral agency. No chain of command can create obligation; only consent can.

## General will versus will of all
The general will aims at the common good of the political community as a whole, contrasting with the will of all, which is merely the sum of private or factional interests. A majority vote is only evidence of the general will when the question asked is general in form.

## From natural to civil freedom
Through participation in lawmaking, citizens transition from natural impulse to civic freedom governed by rules they help author. What is lost is natural independence; what is gained is moral liberty and ownership of the law.

Exam tip: pair Rousseau's general will with Hobbes's sovereign and Locke's limited government to show how the same contract premise produces very different states.`,
  },
  {
    subject: "Literature",
    title: "Memory, Place, and River Motifs in Poetry",
    semester: "Semester 3",
    summary:
      "Examining how landscape, seasonal change, and local history shape identity and poetic imagery.",
    tags: "poetry, landscape, memory",
    body: `## Landscape as memory apparatus
Regional poetry frequently anchors personal memory and cultural continuity in physical landmarks such as rivers, towns, and changing seasons. The river is both a fixed place name and a moving object, which makes it ideal for thinking about continuity and loss at once.

## Space mirrors interiority
Rather than treating landscape as mere background, poets often use spatial movement and environmental detail to mirror inner reflection and historical transition.

- Upstream often stands for origins, ancestry, and return
- Downstream carries associations of exile, change, and time
- The bank or ford marks thresholds and decisions
- Flooding signals disruption of inherited order

Reading approach: trace the movement of the lyric speaker across the landscape and ask what each location lets them remember or refuse.`,
  },
  {
    subject: "Accounting",
    title: "Cost Behavior, Break-Even & Margin of Safety",
    semester: "Semester 2",
    summary:
      "Quick revision summary of fixed vs. variable costs, contribution margin, and break-even volume calculations.",
    tags: "costing, break-even, contribution",
    body: `## Cost behavior
Fixed costs remain constant in total within a relevant activity range, whereas variable costs change in direct proportion to output volume. Semi-variable costs combine both and must be split before analysis.

## Break-even computation
Contribution per unit equals selling price per unit minus variable cost per unit. Dividing total fixed costs by contribution per unit gives the break-even point in units.

- Break-even units = fixed costs / contribution per unit
- Break-even sales value = fixed costs / contribution margin ratio
- Target volume = (fixed costs + required profit) / contribution per unit

## Margin of safety
Margin of safety measures how much sales can drop before incurring a loss, helping managers evaluate operational risk. Express it in units, in revenue, or as a percentage of current sales.

Worked example: fixed costs 48,000; price 40; variable cost 24. Contribution 16, so break-even is 3,000 units. At 4,000 units the margin of safety is 1,000 units, or 25%.`,
  },
  {
    subject: "Management",
    title: "Motivation Theories: Maslow to Herzberg",
    semester: "Semester 4",
    summary:
      "Comparison table of content and process theories of motivation with their managerial implications.",
    tags: "motivation, maslow, herzberg",
    body: `## Content theories
Maslow arranges needs from physiological to self-actualization and implies that a satisfied need stops motivating. Herzberg separates hygiene factors, which prevent dissatisfaction, from motivators, which create satisfaction.

## Process theories
Vroom's expectancy theory frames motivation as expectancy times instrumentality times valence. Adams' equity theory predicts effort adjustments when perceived input-outcome ratios feel unfair.

## Managerial implications
- Pay and conditions are hygiene, not motivators
- Job design, recognition, and growth drive sustained effort
- Match rewards to what the individual actually values
- Perceived fairness matters as much as the size of the reward`,
  },
  {
    subject: "Political Thought",
    title: "Rawls: Justice as Fairness in Two Principles",
    semester: "Semester 5",
    summary:
      "Equal basic liberties, the difference principle, and the original position as a device of representation.",
    tags: "rawls, justice, equality",
    body: `## The original position
Parties behind a veil of ignorance choose principles without knowing their own class, talents, or conception of the good. The device models fairness rather than describing actual bargaining.

## Two principles
First, each person has an equal claim to basic liberties compatible with the same liberties for others. Second, social and economic inequalities are arranged to benefit the least advantaged and attached to positions open to all.

## Priority rules
Liberty has lexical priority over the difference principle, and fair equality of opportunity has priority over the difference principle. Constraints on permissible inequalities follow from that ordering.`,
  },
];

async function runSeed(): Promise<void> {
  const [existing] = await db.select({ value: count() }).from(subjects);
  if ((existing?.value ?? 0) > 0) return;

  for (const seed of seedNotes) {
    const subjectSlug = slugify(seed.subject);
    const [subject] = await db
      .insert(subjects)
      .values({ name: seed.subject, slug: subjectSlug })
      .onConflictDoNothing({ target: subjects.slug })
      .returning();

    const subjectId =
      subject?.id ??
      (
        await db
          .select({ id: subjects.id })
          .from(subjects)
          .where(eq(subjects.slug, subjectSlug))
          .limit(1)
      )[0]?.id;

    if (!subjectId) continue;

    await db
      .insert(notes)
      .values({
        subjectId,
        title: seed.title,
        slug: `${subjectSlug}-${slugify(seed.title)}`,
        summary: seed.summary,
        body: seed.body,
        tags: seed.tags,
        semester: seed.semester,
      })
      .onConflictDoNothing({ target: notes.slug });
  }
}

let seedPromise: Promise<void> | null = null;

/** Idempotent, run-once-per-process seed of the starter library. */
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
