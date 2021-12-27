include!(concat!(env!("OUT_DIR"), "/templates.rs"));
use chrono::{DateTime, Utc, FixedOffset, TimeZone};

fn datetime_to_beats<Tz: TimeZone>(time: DateTime<Tz>) -> u16 {
    use chrono::Timelike;

    let bmt_time = time.with_timezone(&FixedOffset::east(3600));

    let seconds_after_midnight_rounded_to_milliseconds: f64 = 
        (bmt_time.hour() * 3600 + bmt_time.minute() * 60 + bmt_time.second() + (bmt_time.nanosecond() / 1_000_000_000)).into();

    (seconds_after_midnight_rounded_to_milliseconds / 86.4).floor() as u16
}

cgi::cgi_try_main! { |request: cgi::Request| -> Result<cgi::Response, String> {
    eprintln!("{:?}", request);

    let now = Utc::now();

    let beats = datetime_to_beats(now);

    let mut buf = Vec::new();

    templates::index(&mut buf, beats, now).unwrap();

    Ok(cgi::binary_response(200, "text/html", buf))
} }
