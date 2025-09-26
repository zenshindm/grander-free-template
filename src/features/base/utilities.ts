export type listcomponentsAvaiableType = {
  componentName: string;
  componentModule: string;
  componentImg: string;
  data: any;
  props: {
    label: string;
    widget: string;
    name: string;
    optionChoice?: string[];
  }[];
};

export type mutliPageCompType = {
  pageName: string;
  pageTitle: string;
  pageDescription: string;
  PageLayout: string;
  PageImage: any | null;
  compData: listComponentsAvailableType[];
};

export type homePageCompType = {
  pageTitle: string;
  pageDescription: string;
  PageLayout: string;
  PageImage: any | null;
  compData: listComponentsAvailableType[];
};

export type localAssetsImgType = {
  src: string;
  width: number;
  height: number;
  format: string;
};

export type listComponentsAvailableType = {
  componentName: string;
  componentModule: string;
  componentImg: string;
  data: any;
  props: firstLvlProps[];
};

type firstLvlProps = InputWidget | OptionWidget | ArrayFirstWidget;

type InputWidget = {
  label: string;
  widget: "input" | "TextArea" | "img" | "vid" | "editor" | "code";
  name: string;
};

type OptionWidget = {
  label: string;
  widget: "option";
  name: string;
  optionChoice: string[];
};

type ArrayFirstWidget = {
  label: string;
  widget: "array";
  name: string;
  arrayWidget: (InputWidget | OptionWidget | ArraySecondWidget)[];
};

type ArraySecondWidget = {
  label: string;
  widget: "array";
  name: string;
  arrayWidget: (InputWidget | OptionWidget)[];
};

import { type ImageMetadata } from "astro";

export function getLocalAssetsImg(input: string): any {
  let isInputaUrl;
  try {
    new URL(input);
    const image = input;
    isInputaUrl = true;
    return image;
  } catch {
    isInputaUrl = false;
  }

  const images = import.meta.glob<{ default: ImageMetadata }>(
    "/src/assets/*.{jpeg,jpg,png,gif,svg,webp}",
    {
      eager: true,
    }
  );

  const imagePath = `/src/assets/${input}`;
  const specificImage = images[imagePath];

  if (!specificImage) {
    throw new Error(`Image ${imagePath} not found`);
  }
  const image = specificImage.default;
  return image;
}

import { getImage } from "astro:assets";
import { parse } from "node-html-parser";

interface ImportedImage {
  default: ImageMetadata;
}
const images = import.meta.glob<ImportedImage>(
  "@/assets/*.{jpeg,jpg,png,gif,svg,webp}",
  {
    eager: true,
  }
);

const imageImports: Record<string, ImageMetadata> = {};
Object.entries(images).forEach(([path, module]) => {
  const assetPath = path.replace("./src", "@");
  imageImports[assetPath] = module.default;
});

export async function optimizeImagesInString(htmlString: string) {
  const root = parse(htmlString);

  const images = root.querySelectorAll("img");

  for (const img of images) {
    const src = img.getAttribute("title");
    if (src) {
      try {
        const deSource = String(`/src/assets/${src}`);
        const optimizedImage = await getImage({
          src: imageImports[deSource],
          width: 900,
          height: 400,
          format: "avif",
          quality: 80,
        });

        img.setAttribute("src", optimizedImage.src);
        img.setAttribute("alt", "post Image");
        img.setAttribute("width", optimizedImage.attributes.width.toString());
        img.setAttribute("height", optimizedImage.attributes.height.toString());

        img.setAttribute("loading", "lazy");
      } catch (error) {
        throw new Error(`Failed to optimize image: ${src} ${error}`);
      }
    }
  }
  return root.toString();
}
