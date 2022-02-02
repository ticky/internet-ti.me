const { DateTime, Duration, FixedOffsetZone } = luxon;

class BielMeanTimeZone extends FixedOffsetZone {
  static singleton = new BielMeanTimeZone()
  constructor() { super(60) }
  get name() { return 'BMT' }
}

// Welcome to the hack zone, get ready
Object.defineProperties(
  DateTime.prototype,
  {
    // Add a `beats` getter to all luxon.DateTime instances
    beats: {
      get() {
        const bielTime = this.setZone(BielMeanTimeZone.singleton);
        // Returns the current beats, to two digits of centibeats
        return Math.round(bielTime.diff(bielTime.startOf('day')).toMillis() / 864) / 100;
      }
    },

    // Add a `timeZoneName` getter to all luxon.DateTime instances
    timeZoneName: {
      get() {
        return this.toLocaleParts({ timeZoneName: 'short' }).find((part) => part.type === "timeZoneName").value
      }
    },

    // Add a `localTimeZoneName` getter to all luxon.DateTime instances
    localTimeZoneName: {
      get() {
        // Find the first locale which has a non-GMT-offset time zone name for the current time zone
        const idealLocale = ['en-US', 'en-JP', 'en-NZ', 'ja-JP'].find((zoneName) => !this.setLocale(zoneName).timeZoneName.startsWith('GMT'));

        return this.setLocale(idealLocale).timeZoneName;
      }
    }
  }
);

const beatsNumberFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 3 });
