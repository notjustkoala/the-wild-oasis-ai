import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../services/apiBookings";
import toast from "react-hot-toast";

function useCheckout() {
  const queryClient = useQueryClient();

  const { mutate: checkout, isLoading: isCheckingOut } = useMutation({
    mutationFn: (bookingId) =>
      updateBooking(bookingId, {
        status: "checked-out",
      }),
    onSuccess: (data) => {
      toast.success(`Booking #${data.id} 成功 checked out`);
      queryClient.invalidateQueries({ active: true });
    },
    onError: () => toast.error("Check out 出错！！！"),
  });

  return { checkout, isCheckingOut };
}

export default useCheckout;
