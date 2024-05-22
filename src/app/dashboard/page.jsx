import style from "./page.module.css";

const clips = [
  {
    title: "Clip 1",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 2",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 3",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 4",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 5",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 6",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 7",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 8",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 9",
    image: "https://via.placeholder.com/420x280",
  },
  {
    title: "Clip 10",
    image: "https://via.placeholder.com/420x280",
  },
]

function Dashboard() {
  return (
    <div className={style.clipsContainer}>
      {clips.map((_, i) => (
        <div className={style.clipContainer}>
          <div key={i} className={style.clip}>
            <div className={style.clipImage}>
              <img src={_.image} alt={_.title} />
            </div>
          </div>
          <div className={style.clipTitle}>
            {_.title}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;