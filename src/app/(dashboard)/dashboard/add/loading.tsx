import Skeleton from "react-loading-skeleton";

export default function AddFriendLoadingPage() {
  return (
    <div className="w-full flex flex-col gap-3">
      <Skeleton className="mb-4" height={60} width={500} />
      <Skeleton height={20} width={150} />
      <Skeleton height={20} width={400} />
    </div>
  );
}
