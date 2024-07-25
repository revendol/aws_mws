import logger from 'jet-logger';
import {generateKeyPair} from "crypto";
import {IKey} from "@shared/types";
// import {EType} from "@models/Media";

// **** Functions **** //

/**
 * Print an error object if it's truthy. Useful for testing.
 */
export function pErr(err?: Error): void {
  if (!!err) {
    logger.err(err);
  }
}

/**
 * Get a random number between 1 and 1,000
 */
export function _getRandomInt(): number {
  return Math.floor(Math.random() * 1_000);
}


export const _getKeyPair = async (name: string):Promise<IKey> => {
  return new Promise((resolve, reject) => {
    generateKeyPair('rsa',
      {
        modulusLength: 512,
        publicKeyEncoding: {
          type: 'spki',
          format: 'der'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'der',
          cipher: 'aes-256-cbc',
          passphrase: name
        }
      },
      (err, publicKey, privateKey) => {
        if (err) {
          return reject(err);
        }
        //Need to replace all special character as the keys will be used in url as params
        const data:IKey = {
          publicKey: publicKey.toString('base64').replace(/[^a-zA-Z ]/g, ""),
          privateKey: privateKey.toString('base64').replace(/[^a-zA-Z ]/g, "")
        };
        resolve(data);
      });
  });
};

// export const fileTypes = (fileName : string) => {
//   const ext : string = path.extname(fileName);
//   const images = ['jpeg', 'jpg', 'png','tiff', 'psd', 'eps', 'svg', 'ai', 'raw'];
//   const videos = ['mp4', 'mov', 'wmv', 'avi', 'webm', 'mkb'];
//   if(images.indexOf(ext) >= 0){
//     return EType.Image;
//   } else if(videos.indexOf(ext) >= 0){
//     return EType.Video;
//   } else if(ext === 'gif') {
//     return EType.GIF;
//   } else {
//     return EType.TEST;
//   }
// }
// w = number of guest, m= price, o = Provision enthalten (comission included)
export const calculateContributionMargin = (
  w: number,
  m: number,
  o: number,
  contributionMarginC6: number,
  contributionMarginC4: number,
  contributionMarginC5: number
): number => {
  if (w === 0) {
    return 0;
  } else {
    const result = m - o - m * contributionMarginC6 - w * contributionMarginC4 - contributionMarginC5;
    return Math.round(result * 100) / 100; // Rounding to 2 decimal places
  }
}