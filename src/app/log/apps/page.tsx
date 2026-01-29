import LogisticsModalExample from "@/features/log/apps/example/LogisticsModalExample";
import { Check, Eye, MessagesSquare } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div>
      {/* <LogisticsModalExample /> */}

      <div>Valera</div>

      <div className="bg-gray-700 max-w-[400px] text-white">
        <div className="header flex justify-between p-2  rounded-4xl">
          <h2>Замовлення 4-2</h2>
          <span className="badge"> Очікує</span>
        </div>

        <div className="main-info flex flex-col gap-2 p-2">
          <span>Тип:Крихкий</span>
          <span>Тип:Крихкий</span>
          <span>Вага:Крихкий</span>
          <span>Тип:Крихкий</span>
          <span>Тип:Крихкий</span>
          <span>Тип:Крихкий</span>
          <span>Тип:Крихкий</span>
        </div>

        <div className="buttons-group flex flex-row justify-between ">
          <button className="bg-green-200 p-2">
            {" "}
            <Check />{" "}
          </button>
          <button>
            {" "}
            <MessagesSquare />{" "}
          </button>
          <button>
            {" "}
            <Eye />{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;
