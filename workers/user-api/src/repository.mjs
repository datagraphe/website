const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const booleanKeys = ['email_enabled', 'new_tests', 'verified_changes', 'new_comparisons', 'datagraphe_news'];

export class D1UserRepository {
  constructor(db) { this.db = db; }

  async upsertUser(identity) {
    const timestamp = now();
    let row = await this.db.prepare('SELECT * FROM app_users WHERE clerk_user_id = ?').bind(identity.clerkUserId).first();
    if (!row) {
      const userId = id('usr');
      await this.db.batch([
        this.db.prepare(`INSERT INTO app_users(id,clerk_user_id,primary_email,locale,status,created_at,updated_at)
          VALUES(?,?,?,?, 'ACTIVE', ?, ?)`).bind(userId, identity.clerkUserId, identity.email ?? null, identity.locale ?? 'fr', timestamp, timestamp),
        this.db.prepare(`INSERT INTO notification_preferences(user_id,email_enabled,new_tests,verified_changes,new_comparisons,datagraphe_news,created_at,updated_at)
          VALUES(?,1,1,1,1,0,?,?)`).bind(userId, timestamp, timestamp)
      ]);
      row = await this.db.prepare('SELECT * FROM app_users WHERE id = ?').bind(userId).first();
    } else {
      await this.db.prepare(`UPDATE app_users SET primary_email = ?, locale = ?, updated_at = ? WHERE id = ?`)
        .bind(identity.email ?? row.primary_email ?? null, identity.locale ?? row.locale ?? 'fr', timestamp, row.id).run();
      row = await this.db.prepare('SELECT * FROM app_users WHERE id = ?').bind(row.id).first();
    }
    return row;
  }

  async getMe(userId) {
    const user = await this.db.prepare('SELECT id,primary_email,locale,status,created_at,updated_at FROM app_users WHERE id = ?').bind(userId).first();
    const counts = await this.db.prepare(`SELECT subscription_type, COUNT(*) AS total FROM user_subscriptions
      WHERE user_id = ? AND status = 'ACTIVE' GROUP BY subscription_type`).bind(userId).all();
    const preferences = await this.getPreferences(userId);
    return { ...user, counts: Object.fromEntries((counts.results ?? []).map((row) => [row.subscription_type, Number(row.total)])), preferences };
  }

  async listSubscriptions(userId) {
    const result = await this.db.prepare(`SELECT id,subscription_type,target_key,status,created_at,updated_at
      FROM user_subscriptions WHERE user_id = ? AND status != 'UNSUBSCRIBED' ORDER BY created_at DESC`).bind(userId).all();
    return result.results ?? [];
  }

  async follow(userId, target) {
    const timestamp = now();
    const subscriptionId = id('sub');
    await this.db.prepare(`INSERT INTO user_subscriptions(id,user_id,subscription_type,target_key,status,created_at,updated_at)
      VALUES(?,?,?,?, 'ACTIVE', ?, ?)
      ON CONFLICT(user_id,subscription_type,target_key) DO UPDATE SET status='ACTIVE',updated_at=excluded.updated_at`)
      .bind(subscriptionId, userId, target.subscription_type, target.target_key, timestamp, timestamp).run();
    return this.db.prepare(`SELECT id,subscription_type,target_key,status,created_at,updated_at FROM user_subscriptions
      WHERE user_id = ? AND subscription_type = ? AND target_key = ?`).bind(userId, target.subscription_type, target.target_key).first();
  }

  async unfollow(userId, subscriptionId) {
    const result = await this.db.prepare(`UPDATE user_subscriptions SET status='UNSUBSCRIBED',updated_at=?
      WHERE id=? AND user_id=? AND status!='UNSUBSCRIBED'`).bind(now(), subscriptionId, userId).run();
    return Number(result.meta?.changes ?? 0) === 1;
  }

  async getPreferences(userId) {
    return this.db.prepare(`SELECT email_enabled,new_tests,verified_changes,new_comparisons,datagraphe_news,updated_at
      FROM notification_preferences WHERE user_id = ?`).bind(userId).first();
  }

  async updatePreferences(userId, input) {
    const current = await this.getPreferences(userId);
    const next = Object.fromEntries(booleanKeys.map((key) => [key, input[key] === undefined ? Number(current[key]) : Number(Boolean(input[key]))]));
    await this.db.prepare(`UPDATE notification_preferences SET email_enabled=?,new_tests=?,verified_changes=?,new_comparisons=?,datagraphe_news=?,updated_at=? WHERE user_id=?`)
      .bind(next.email_enabled, next.new_tests, next.verified_changes, next.new_comparisons, next.datagraphe_news, now(), userId).run();
    return this.getPreferences(userId);
  }

  async requestDeletion(userId) {
    const timestamp = now();
    await this.db.batch([
      this.db.prepare(`UPDATE app_users SET status='DELETION_REQUESTED',updated_at=? WHERE id=?`).bind(timestamp, userId),
      this.db.prepare(`UPDATE user_subscriptions SET status='PAUSED',updated_at=? WHERE user_id=? AND status='ACTIVE'`).bind(timestamp, userId)
    ]);
    return { status: 'DELETION_REQUESTED', irreversible: false };
  }
}
