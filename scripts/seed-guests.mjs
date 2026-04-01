import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

await sql`
  INSERT INTO guests (id, name, initials, bio, episode_title) VALUES
  ('guest_aosei', 'Dr. Amara Osei', 'AO', 'Chief AI Officer at Meridian Health Systems and former MIT research fellow. Dr. Osei specializes in the ethical deployment of machine learning in healthcare and has advised the WHO on AI governance frameworks.', 'Responsible AI in Healthcare: From Lab to Bedside'),
  ('guest_mchenramirez', 'Marcus Chen-Ramirez', 'MC', 'Managing Director of Venture Intelligence at Horizon Capital and co-author of The Algorithmic Enterprise. He has led over $2B in AI-focused investments across fintech, logistics, and defense sectors.', E'Venture Capital''s Bet on Generative AI: Hype vs. Reality'),
  ('guest_isolberg', 'Prof. Ingrid Solberg', 'IS', E'Chair of Digital Strategy at INSEAD and Senior Fellow at the Brookings Institution. Prof. Solberg''s research focuses on how executive teams integrate AI into corporate decision-making without losing organizational agility.', 'Boardroom AI: How Leaders Make Decisions with Machines')
  ON CONFLICT (id) DO NOTHING
`;

console.log('Seeded 3 guests');
await sql.end();
