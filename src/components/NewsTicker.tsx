const items = [
  "Ask about Admissions",
  "Tuition Fees & Scholarships",
  "Programs Offered",
  "Campus Life & Facilities",
  "Library Hours",
  "Contact Us",
  "Academic Calendar",
  "Student Accommodation",
];

const NewsTicker = () => {
  return (
    <div className="w-full overflow-hidden bg-primary py-1.5">
      <div className="ticker-animate whitespace-nowrap flex items-center gap-8">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs text-primary-foreground/90 font-medium">
            ✦ {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;
