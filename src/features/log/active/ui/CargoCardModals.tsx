"use client";

import React from "react";

import { Dropdowns, LoadApiItem } from "../../types/load.type";
import { CargoCardController } from "../hooks/useCargoCard";
import { CargoDetailsDrawer } from "./CargoDetailsDrawer";
import { AddCarsModal } from "./CargoCarAddModal";
import { CargoCarRemoveModal } from "./CargoCarRemoveModal";
import { CargoCloseByManagerModal } from "./CargoCloseByManagerModal";
import { CargoHistoryModal } from "./CargoHistoryModal";
import LoadChat from "./LoadChat";

interface CargoCardModalsProps {
  load: LoadApiItem;
  filters?: Dropdowns;
  ctrl: CargoCardController;
}

/**
 * Модалки заявки — спільні для вигляду плиткою і списком.
 */
export function CargoCardModals({ load, filters, ctrl }: CargoCardModalsProps) {
  return (
    <>
      <CargoDetailsDrawer
        cargo={ctrl.selectedCargo ?? undefined}
        open={!!ctrl.selectedCargo}
        onClose={() => ctrl.setSelectedCargo(null)}
      />

      {ctrl.chatCargo && (
        <LoadChat
          cargoId={ctrl.chatCargo.id}
          open={!!ctrl.chatCargo}
          onClose={() => {
            ctrl.setChatCargo(null);
            ctrl.setLocalReadTime(new Date().toISOString());
          }}
        />
      )}

      <AddCarsModal
        loadId={load.id}
        open={ctrl.openAddCars}
        onOpenChange={ctrl.setOpenAddCars}
        onSubmit={ctrl.addCarsMutate}
        isLoading={ctrl.isLoadingAddCars}
      />

      <CargoCarRemoveModal
        load={load}
        open={ctrl.openRemoveCars}
        onOpenChange={ctrl.setOpenRemoveCars}
        onSubmit={ctrl.removeCarsMutate}
        isLoading={ctrl.isLoadingRemove}
        dropdowns={filters}
      />

      <CargoCloseByManagerModal
        dropdowns={filters}
        load={load}
        open={ctrl.openCloseCargoByManager}
        onOpenChange={ctrl.setOpenCloseCargoByManager}
        onSubmit={ctrl.closeCargoMutate}
        isLoading={ctrl.isLoadingCloseCargo}
      />

      <CargoHistoryModal
        open={ctrl.openHistory}
        onOpenChange={ctrl.setOpenHistory}
        loadId={load.id}
      />
    </>
  );
}
