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

document.addEventListener('DOMContentLoaded', () => {
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

  const updateTime = (dateTime, currentBeats=Math.floor(dateTime.beats)) => {
    const beatsString = `@${beatsNumberFormatter.format(currentBeats)}`;

    document.title = `${beatsString} - internet-ti.me`;
    beatsHeading.innerText = beatsString;
    beatsPermalink.href = `/${beatsString}`;
    beatsPermalink.querySelector('span.beats').innerText = beatsString;
    referenceWrapper.dataset.beats = beatsString;

    timeZoneElements.forEach(({ timeWrapperElement, timeElement, zoneElement }) => {
      const timeInZone = dateTime.setZone(timeWrapperElement.dataset.zone ? timeWrapperElement.dataset.zone : BielMeanTimeZone.singleton);

      timeElement.innerText = timeInZone.toLocaleString({ hour: 'numeric', minute: 'numeric', hour12: timeWrapperElement.dataset.zone === 'local' ? undefined : false });
      timeWrapperElement.setAttribute('datetime', timeInZone.toISO());

      // Update the time zone names if it's got an associated IANA zone name
      if (timeWrapperElement.dataset.zone) {
        if (timeWrapperElement.dataset.zone !== 'local') {
          zoneElement.innerText = timeInZone.localTimeZoneName;
        } else {
          zoneElement.innerText = timeInZone.timeZoneName;
        }
      }

      if (timeWrapperElement.parentElement.style.display == 'none') {
        timeWrapperElement.parentElement.style.display = '';
      }
    });
  };

  const liveUpdateTime = () => {
    const dateTime = DateTime.now().setZone(BielMeanTimeZone.singleton);
    const currentBeats = Math.floor(dateTime.beats);

    if (currentBeats !== lastBeats) {
      lastBeats = currentBeats;
      updateTime(dateTime, currentBeats);
    }

    window.requestAnimationFrame(liveUpdateTime);
  };

  if (referenceWrapper.dataset.live === 'true') {
    liveUpdateTime();
  } else {
    const currentBeats = parseInt(referenceWrapper.dataset.beats, 10);

    const dateTime = (
      DateTime.fromISO(document.querySelector('time[datetime$="+01:00"]').dateTime)
        .setZone(BielMeanTimeZone.singleton)
        .startOf('day')
        .plus(currentBeats * 86400)
    );

    updateTime(dateTime);
  }
});