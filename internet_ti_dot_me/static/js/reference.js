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

  let lastBeats;

  const updateTime = (dateTime, currentBeats=Math.floor(dateTime.beats)) => {
    const beatsPadded = beatsNumberFormatter.format(currentBeats);
    const beatsString = `@${beatsPadded}`;

    document.title = `${beatsString} - internet-ti.me`;
    beatsHeading.innerText = beatsString;
    beatsPermalink.href = `/${beatsString}`;
    beatsPermalink.querySelector('span.beats').innerText = beatsString;
    referenceWrapper.dataset.beats = beatsPadded;

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