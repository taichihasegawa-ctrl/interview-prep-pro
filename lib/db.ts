import { sql } from '@vercel/postgres';

export interface Generation {
  id: number;
  user_id: string;
  type: 'questions' | 'correction';
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  created_at: string;
}

export async function saveGeneration(
  userId: string,
  type: 'questions' | 'correction',
  inputData: Record<string, unknown>,
  outputData: Record<string, unknown>
): Promise<void> {
  try {
    await sql`
      INSERT INTO generations (user_id, type, input_data, output_data)
      VALUES (${userId}, ${type}, ${JSON.stringify(inputData)}, ${JSON.stringify(outputData)})
    `;
  } catch (error) {
    console.error('Save generation error:', error);
  }
}

export async function getGenerations(userId: string): Promise<Generation[]> {
  try {
    const { rows } = await sql`
      SELECT * FROM generations
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return rows as Generation[];
  } catch (error) {
    console.error('Get generations error:', error);
    return [];
  }
}

export async function deleteGeneration(id: number, userId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM generations
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Delete generation error:', error);
  }
}
