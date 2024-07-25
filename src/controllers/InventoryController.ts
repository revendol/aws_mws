import { Request, Response } from "express";
import InventoryService from "@services/InventoryService";
import StatusCode from "http-status-codes";
const {OK } = StatusCode;
import { success, failure } from "@shared/response";
import ErrorMessage from "@shared/errorMessage";
import {IInventory} from "@models/Inventory";
import InventoryInput from "../types/Controller/Inventory";

class InventoryController {
  async getInventory(req: Request, res: Response) {
    try {
      let inventory = await InventoryService.all();
      if(inventory.length === 0) {
        const data : IInventory[] = [
          {
            germanName: "Spannbettlaken",
            name: "Fitted Sheet",
            totalInventory: 0,
            inApartment: 0,
            usedInCellar: 0,
            cleanInCellar: 0,
            inLaundry: 0,
          },
          {
            germanName: "kleine Handtücher",
            name: "Small Towel",
            totalInventory: 0,
            inApartment: 0,
            usedInCellar: 0,
            cleanInCellar: 0,
            inLaundry: 0,
          },
          {
            germanName: "große Handtücher",
            name: "Large Towel",
            totalInventory: 0,
            inApartment: 0,
            usedInCellar: 0,
            cleanInCellar: 0,
            inLaundry: 0,
          },
          {
            germanName: "Badvorleger",
            name: "Bath Mat",
            totalInventory: 0,
            inApartment: 0,
            usedInCellar: 0,
            cleanInCellar: 0,
            inLaundry: 0,
          },
          {
            germanName: "Große Kopfkissen",
            name: "Big Pillow",
            totalInventory: 0,
            inApartment: 0,
            usedInCellar: 0,
            cleanInCellar: 0,
            inLaundry: 0,
          },
          {
            germanName: "kleine Kopfkissen",
            name: "Small Pillow",
            totalInventory: 0,
            inApartment: 0,
            usedInCellar: 0,
            cleanInCellar: 0,
            inLaundry: 0,
          },
          {
            germanName: "Bettbezüge",
            name: "Duvet Cover",
            totalInventory: 0,
            inApartment: 0,
            usedInCellar: 0,
            cleanInCellar: 0,
            inLaundry: 0,
          }
        ];
        await InventoryService.bulkCreate(data);
        inventory = await InventoryService.all();
      }
      return res.status(OK).send(success(ErrorMessage.HTTP_OK, inventory));
    } catch (errors) {
      return res.status(500).send(failure({
        message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
        errors
      }));
    }
  }

  async updateInventory(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const data = req.body as InventoryInput;
      //Validate if total inventory is equal to sum of inApartment, usedInCellar, cleanInCellar and inLaundry
      if(data.totalInventory !== (
        data.inApartment +
        data.usedInCellar +
        data.cleanInCellar +
        data.inLaundry)
      ) {
        return res.status(400).send(failure({
          message: ErrorMessage.HTTP_BAD_REQUEST,
          errors: "Total Inventory should be equal to sum of inApartment, usedInCellar, cleanInCellar and inLaundry"
        }));
      }
      const update = await InventoryService.update({ _id: id }, data);
      return res.status(OK).send(success(ErrorMessage.HTTP_OK, update));
    } catch (errors) {
      return res.status(500).send(failure({
        message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
        errors
      }));
    }
  }

  // async checkData(req: Request, res: Response) {
  //   try {
  //     return res.status(OK).send(success(ErrorMessage.HTTP_OK, await InventoryService.writeToGoogleSheet()));
  //   } catch (errors) {
  //     return res.status(500).send(failure({
  //       message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
  //       errors
  //     }));
  //   }
  // }

  //to check manually
  async checkCalculationOfUsage(req: Request, res: Response) {
    try {
      return res.status(OK).send(success(ErrorMessage.HTTP_OK, await InventoryService.calculationOfUsage()));
    } catch (errors) {
      return res.status(500).send(failure({
        message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
        errors
      }));
    }
  }

}

export default new InventoryController();