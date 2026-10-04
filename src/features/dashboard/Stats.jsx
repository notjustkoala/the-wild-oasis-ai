import {
  HiOutlineBanknotes,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
} from "react-icons/hi2";
import Stat from "./Stat";
import { formatCurrency } from "../../utils/helpers";

function toFiniteNumber(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getOccupancyPercent(confirmedStays, numDays, cabinCount) {
  const days = toFiniteNumber(numDays);
  const cabins = toFiniteNumber(cabinCount);

  if (days === null || days <= 0 || cabins === null || cabins <= 0) return 0;

  const occupiedNights = confirmedStays.reduce((total, stay) => {
    const nights = toFiniteNumber(stay?.numNights);
    return nights === null || nights < 0 ? total : total + nights;
  }, 0);

  const percent = (occupiedNights / days / cabins) * 100;
  return Number.isFinite(percent) ? Math.round(percent) : 0;
}

function Stats({ bookings, confirmedStays, numDays, cabinCount }) {
  const numBookings = bookings.length;

  const sales = bookings.reduce((acc, cur) => acc + cur.totalPrice, 0);

  const checkins = confirmedStays.length;

  const occupancyPercent = getOccupancyPercent(
    confirmedStays,
    numDays,
    cabinCount
  );

  return (
    <>
      <Stat
        title="bookings"
        color="blue"
        icon={<HiOutlineBriefcase />}
        value={numBookings}
      />
      <Stat
        title="Sales"
        color="green"
        icon={<HiOutlineBanknotes />}
        value={formatCurrency(sales)}
      />
      <Stat
        title="Check ins"
        color="indigo"
        icon={<HiOutlineCalendarDays />}
        value={checkins}
      />
      <Stat
        title="Occupancy rate"
        color="yellow"
        icon={<HiOutlineChartBar />}
        value={`${occupancyPercent}%`}
      />
    </>
  );
}

export default Stats;
