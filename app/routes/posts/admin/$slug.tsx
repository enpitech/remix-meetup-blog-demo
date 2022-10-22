import { Outlet } from "@remix-run/react";

export default function UpdatePostLayour() {
  return (
    <div className="p-3">
      <p className=" mb-3 text-lg">
        This is the Admin/$slug layout route. you can update or delete the
        selected post
      </p>
      <Outlet />
    </div>
  );
}
