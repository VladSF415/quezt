// The three contests' rules, from the coach's rules flyers (Nov 2026), in plain sentences.
// The 3-point flyer says both "4 points per rack" and "regular ball 1 point, money ball 2 points";
// this follows its scoring box (4 regular balls and a money ball at each spot).
export type RuleBlock = { heading: string; items: string[] };
export type ContestRules = { id: string; title: string; summary: string; note: string; blocks: RuleBlock[] };

export const RULES: ContestRules[] = [
  {
    id: "rules-3on3",
    title: "3 on 3 Tournament",
    summary: "Half court. First to 15 points or a 12-minute clock.",
    note: "Our goal is a competitive, safe and fun day for everyone. Please respect the game, your opponents, officials, volunteers and spectators.",
    blocks: [
      {
        heading: "Teams",
        items: [
          "Up to 4 players per team: 3 on the court and 1 substitute.",
          "At least 3 players to start a game.",
          "Each player plays on one team only.",
          "Check in 15 minutes before your scheduled game.",
          "Wear matching shirts or jerseys when you can.",
          "Athletic shoes are required.",
        ],
      },
      {
        heading: "Games",
        items: [
          "First team to 15 points, or a 12-minute running clock, whichever comes first.",
          "Championship game: first team to 21 points, or a 15-minute running clock, whichever comes first.",
          "If it's tied, the first team to score 2 points wins.",
          "One 30-second timeout per team. The clock keeps running unless tournament staff stop it.",
        ],
      },
      {
        heading: "Scoring",
        items: ["Basket inside the arc: 1 point.", "Basket behind the arc: 2 points.", "Free throw: 1 point."],
      },
      {
        heading: "Possession",
        items: [
          "A coin flip decides the first possession.",
          "Every possession starts with a check ball at the top of the key.",
          "After a made basket, the ball goes to the other team, checked at the top.",
          "Clear defensive rebounds and steals behind the three-point line before you try to score.",
        ],
      },
      {
        heading: "Fouls and conduct",
        items: [
          "Referees call the fouls, not the players. Excessive contact will not be tolerated.",
          "Technical fouls (unsportsmanlike conduct, arguing, taunting, profanity toward officials or opponents): one free throw plus possession.",
          "Fighting, threatening another player, racist or hateful language, intentionally injuring another player, or leaving the bench during an altercation gets a player removed from the tournament.",
          "A team that isn't ready 10 minutes after its game time forfeits, 15-0.",
        ],
      },
      {
        heading: "Final say",
        items: [
          "The tournament director has final say on rules, scheduling, player eligibility, ejections, protests and weather delays. All decisions are final.",
        ],
      },
    ],
  },
  {
    id: "rules-1v1",
    title: "1v1 King of the Court",
    summary: "First to 24 by 2s and 3s. Free to enter.",
    note: "All age divisions. Free, no payment. Hosted by Trevor Dunbar.",
    blocks: [
      {
        heading: "Rules",
        items: [
          "First player to 24 points wins, scoring by 2s and 3s.",
          "The game is played with one possession.",
          "5-dribble limit: after 5 dribbles, the ball must be passed or shot, or possession changes.",
          "A shooting foul is one free throw.",
          "Two fouls in a row by the same player gives the opponent one free throw.",
          "A missed free throw gives the ball to the other player.",
          "Each player gets one timeout per half.",
          "Hitting the ball out of the other player's hand or out of their control is an automatic turnover.",
        ],
      },
    ],
  },
  {
    id: "rules-3point",
    title: "3-Point Contest",
    summary: "60 seconds, 5 spots around the arc. Free to enter.",
    note: "Free, no payment. Everyone is welcome. Winners get trophies.",
    blocks: [
      {
        heading: "Contest",
        items: [
          "60 seconds to score as many points as you can.",
          "5 shooting spots around the arc, including the top of the key, with 5 balls at each spot.",
          "Each spot has 4 regular balls worth 1 point each and a money ball (the last ball) worth 2 points.",
          "No rebounds: a volunteer or staff member passes you the balls.",
          "Tiebreaker: a 30-second shootout from the top of the key.",
        ],
      },
      {
        heading: "Age groups",
        items: ["10 & under, boys and girls.", "14 & under, boys and girls.", "18 & under, men and women.", "18 & up, men and women."],
      },
      {
        heading: "Signing up",
        items: [
          "You can sign up here or on site. Spots are limited, first come, first served.",
          "Check in 30 minutes before your age group starts.",
          "Bring water and wear athletic gear.",
        ],
      },
    ],
  },
];
