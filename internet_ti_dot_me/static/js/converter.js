document.addEventListener('DOMContentLoaded', () => {
  const beatsSelect = document.querySelector('#beats-input > select');
  const beatsInput = document.querySelector('#beats-input > input');

  for (var index = 0; index < 1000; index++) {
    const optionElement = document.createElement('option');
    optionElement.value = index;
    optionElement.innerText = beatsNumberFormatter.format(index);
    beatsSelect.appendChild(optionElement);
  }

  beatsSelect.value = beatsInput.value;

  const converterWrapper = document.getElementById('converter');
  const beatsPermalink = document.getElementById('permalink');
  const timeZoneElements = Array.prototype.map.call(
    document.querySelectorAll('#time-zones > li > time'),
    (timeWrapperElement) => ({
      timeWrapperElement,
      timeInputElement: timeWrapperElement.querySelector('input[type="time"]'),
      zoneElement: timeWrapperElement.querySelector('span.zone')
    })
  );

  const updateTime = (dateTime, currentBeats=Math.floor(dateTime.beats)) => {
    const beatsPadded = beatsNumberFormatter.format(currentBeats);
    const beatsString = `@${beatsPadded}`;

    beatsSelect.value = currentBeats;
    beatsInput.value = beatsPadded;
    document.title = `${beatsString} - internet-ti.me converter`;
    beatsPermalink.href = `/${beatsString}`;
    beatsPermalink.querySelector('span.beats').innerText = beatsString;
    converterWrapper.dataset.beats = beatsPadded;

    timeZoneElements.forEach(({ timeWrapperElement, timeInputElement, zoneElement }) => {
      const timeInZone = dateTime.setZone(timeWrapperElement.dataset.zone ? timeWrapperElement.dataset.zone : BielMeanTimeZone.singleton);

      timeInputElement.value = timeInZone.toLocaleString({ hour: 'numeric', minute: 'numeric', hour12: false });
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

  beatsSelect.addEventListener('change', (event) => {
    const currentBeats = beatsNumberFormatter.format(event.target.value);

    const dateTime = (
      DateTime.fromISO(document.querySelector('time[datetime$="+01:00"]').dateTime)
        .setZone(BielMeanTimeZone.singleton)
        .startOf('day')
        .plus(currentBeats * 86400)
    );

    updateTime(dateTime);
  });

  beatsInput.addEventListener('change', (event) => {
    const currentBeats = beatsNumberFormatter.format(event.target.value.slice(0, 3));

    const dateTime = (
      DateTime.fromISO(document.querySelector('time[datetime$="+01:00"]').dateTime)
        .setZone(BielMeanTimeZone.singleton)
        .startOf('day')
        .plus(currentBeats * 86400)
    );

    updateTime(dateTime);
  });

  timeZoneElements.forEach(({ timeWrapperElement, timeInputElement }) => {
    timeInputElement.addEventListener('change', (event) => {
      const dateTime = (
        DateTime.fromISO(timeWrapperElement.dateTime)
          .setZone(timeWrapperElement.dataset.zone ? timeWrapperElement.dataset.zone : BielMeanTimeZone.singleton)
          .startOf('day')
          .plus(Duration.fromISOTime(event.target.value))
      );

      updateTime(dateTime);
    });
  });

  const currentBeats = parseInt(converterWrapper.dataset.beats, 10);

  const dateTime = (
    DateTime.fromISO(document.querySelector('time[datetime$="+01:00"]').dateTime)
      .setZone(BielMeanTimeZone.singleton)
      .startOf('day')
      .plus(currentBeats * 86400)
  );

  updateTime(dateTime);
});