import Skeleton from "react-loading-skeleton";

export default function FriendRequestsLoadingPage() {
  return (
    <div className="w-full flex flex-col gap-3">
      <Skeleton className="mb-4" height={60} width={500} />
      <Skeleton count={3} height={20} width={350} />
    </div>
  );
}
