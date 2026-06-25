const EventEmitter = require("events");

class WellbeingService extends EventEmitter {
  constructor(settingsManager) {
    super();
    this.settingsManager = settingsManager;
    this.state = {
      sessionActive: false,
      sessionStartedAt: "",
      sessionEndsAt: "",
      minutesRemaining: 0,
      status: "Ready",
      breakReminderStatus: "Break reminders idle"
    };
    this.timer = null;
    this.lastReminderAt = "";
  }

  initialize() {
    this.stopTicker();
    this.state = {
      ...this.state,
      sessionActive: false,
      sessionStartedAt: "",
      sessionEndsAt: "",
      minutesRemaining: 0,
      status: "Ready",
      breakReminderStatus: this.settingsManager.getPublicSettings().wellbeing.breakReminders
        ? "Break reminders armed"
        : "Break reminders disabled"
    };
  }

  startSession() {
    const minutes = this.settingsManager.getPublicSettings().wellbeing.focusSessionMinutes;
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + minutes * 60000);

    this.state.sessionActive = true;
    this.state.sessionStartedAt = startedAt.toISOString();
    this.state.sessionEndsAt = endsAt.toISOString();
    this.state.minutesRemaining = minutes;
    this.state.status = "Focus session active";
    this.state.breakReminderStatus = this.settingsManager.getPublicSettings().wellbeing.breakReminders
      ? "Break reminders armed"
      : "Break reminders disabled";

    this.emit("session-started", this.getState());
    this.emit("updated", this.getState());
    this.startTicker();
  }

  stopSession() {
    if (!this.state.sessionActive) {
      return;
    }

    this.stopTicker();
    this.state.sessionActive = false;
    this.state.sessionStartedAt = "";
    this.state.sessionEndsAt = "";
    this.state.minutesRemaining = 0;
    this.state.status = "Focus session stopped";
    this.state.breakReminderStatus = this.settingsManager.getPublicSettings().wellbeing.breakReminders
      ? "Break reminders idle"
      : "Break reminders disabled";
    this.emit("session-stopped", this.getState());
    this.emit("updated", this.getState());
  }

  getState() {
    return { ...this.state };
  }

  startTicker() {
    this.stopTicker();
    this.timer = setInterval(() => this.tick(), 15000);
  }

  stopTicker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tick() {
    if (!this.state.sessionActive || !this.state.sessionEndsAt) {
      return;
    }

    const now = Date.now();
    const end = new Date(this.state.sessionEndsAt).getTime();
    const minutesRemaining = Math.max(0, Math.ceil((end - now) / 60000));
    this.state.minutesRemaining = minutesRemaining;

    if (minutesRemaining <= 0) {
      this.state.sessionActive = false;
      this.state.status = "Focus session complete";
      this.state.breakReminderStatus = "Take a short break";
      this.emit("break-reminder", {
        title: "Focus session complete",
        body: "Take a short break and review your privacy posture before continuing."
      });
      this.emit("updated", this.getState());
      this.stopTicker();
      return;
    }

    if (this.shouldSendMidSessionReminder(minutesRemaining)) {
      this.lastReminderAt = new Date().toISOString();
      this.state.breakReminderStatus = `Break reminder sent with ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"} remaining`;
      this.emit("break-reminder", {
        title: "Break reminder",
        body: `You have ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"} left in the current focus session.`
      });
    } else {
      this.state.breakReminderStatus = this.settingsManager.getPublicSettings().wellbeing.breakReminders
        ? "Break reminders armed"
        : "Break reminders disabled";
    }

    this.emit("updated", this.getState());
  }

  shouldSendMidSessionReminder(minutesRemaining) {
    if (!this.settingsManager.getPublicSettings().wellbeing.breakReminders) {
      return false;
    }
    if (minutesRemaining > 5) {
      return false;
    }
    if (!this.lastReminderAt) {
      return true;
    }
    const last = new Date(this.lastReminderAt).getTime();
    return Date.now() - last > 4 * 60000;
  }

  dispose() {
    this.stopTicker();
  }
}

module.exports = { WellbeingService };
