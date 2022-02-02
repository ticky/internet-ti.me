const { DateTime, FixedOffsetZone } = luxon;

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
        return Math.round((bielTime.second + bielTime.minute * 60 + bielTime.hour * 3600) / .864) / 100;
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

const referenceWrapper = document.getElementById('reference');
const beatsHeading = document.getElementById('beats');
const beatsPermalink = document.getElementById('permalink');
const timeZoneElements = Array.prototype.map.call(
  document.querySelectorAll('#time-zones > li > time'),
  (timeWrapperElement) => ({
    timeWrapperElement,
    timeElement: timeWrapperElement.querySelector('span.time'),
    zoneElement: timeWrapperElement.querySelector('span.zone')
  })
);

const beatsNumberFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 3 });
let lastBeats;

const updateTime = () => {
  const dateTime = DateTime.now().setZone(BielMeanTimeZone.singleton);
  const currentBeats = Math.floor(dateTime.beats);

  if (currentBeats !== lastBeats) {
    lastBeats = currentBeats;

    const beatsString = `@${beatsNumberFormatter.format(currentBeats)}`;

    document.title = `${beatsString} - internet-ti.me`;
    beatsHeading.innerText = beatsString;
    beatsPermalink.href = `/${beatsString}`;
    beatsPermalink.querySelector('span.beats').innerText = beatsString;
    referenceWrapper.dataset.beats = beatsString;

    timeZoneElements.forEach(({ timeWrapperElement, timeElement, zoneElement }) => {
      const timeInZone = dateTime.setZone(timeWrapperElement.dataset.zone ? timeWrapperElement.dataset.zone : BielMeanTimeZone.singleton);

      timeElement.innerText = timeInZone.toLocaleString({ hour: 'numeric', minute: 'numeric', hour12: false });
      timeWrapperElement.setAttribute('datetime', timeInZone.toISO());

      // Update the time zone names if it's got an associated IANA zone name
      if (timeWrapperElement.dataset.zone) {
        zoneElement.innerText = timeInZone.localTimeZoneName;
      }
    });
  }

  window.requestAnimationFrame(updateTime);
};

updateTime();