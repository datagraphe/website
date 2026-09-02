import { ALLOWED_CHANGE_SUBTYPES } from './constants.mjs';

export class TemporalEventSource {
  constructor(readOnlyDatabase) { this.db = readOnlyDatabase; }

  async listVerifiedPublicChanges(since) {
    const result = await this.db.prepare(`SELECT e.id,e.event_type,e.title,e.summary,e.confirmed_at,e.public_status,e.verification_status,
      s.slug AS software_slug,s.name AS software_name
      FROM events e JOIN software s ON s.id=e.software_id
      WHERE e.confirmed_at>=? AND e.public_status IN ('PUBLISHABLE','PUBLISHED')
        AND e.verification_status IN ('VERIFIED','CONFIRMED')
      ORDER BY e.confirmed_at,e.id`).bind(since).all();
    return (result.results ?? []).filter((row) => ALLOWED_CHANGE_SUBTYPES.has(row.event_type)).map((row) => ({
      event_id: row.id,
      event_version: 'temporal-v1',
      event_type: 'VERIFIED_SOFTWARE_CHANGE',
      change_subtype: row.event_type,
      software_slug: row.software_slug,
      software_name: row.software_name,
      summary: row.summary || row.title,
      verified_at: row.confirmed_at,
      public_url: `https://datagraphe.com/fr/tests/${row.software_slug}/`,
      verification_status: row.verification_status,
      public_status: row.public_status,
      locale: 'fr'
    }));
  }
}
