import { z } from "astro/zod";
import { parse } from "node-html-parser";
import { getImage } from "astro:assets";
import { type ImageMetadata } from "astro";

export type ArrayWidget = {
  label: string;
  widget: "array";
  name: string;
  arrayWidget: (InputWidget | OptionWidget | ArrayWidget)[];
};
export type InputWidget = z.infer<typeof inputWidgetSchema>;
export type OptionWidget = z.infer<typeof optionWidgetSchema>;
export type ComponentType = z.infer<typeof CompTypeSchema>;
export type PropWiget = InputWidget | OptionWidget | ArrayWidget;
export const arrayWidgetSchema: z.ZodSchema<ArrayWidget> = z.lazy(() =>
  z.object({
    label: z.string(),
    widget: z.literal("array"),
    name: z.string(),
    arrayWidget: z.array(
      z.union([inputWidgetSchema, optionWidgetSchema, arrayWidgetSchema]),
    ),
  }),
);
const inputWidgetSchema = z.object({
  label: z.string(),
  widget: z.union([
    z.literal("input"),
    z.literal("btn"),
    z.literal("TextArea"),
    z.literal("vid"),
    z.literal("img"),
    z.literal("editor"),
    z.literal("code"),
  ]),
  name: z.string(),
});
const optionWidgetSchema = z.object({
  label: z.string(),
  widget: z.literal("option"),
  name: z.string(),
  option: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),
});
export const propWigetSchema = z.union([
  inputWidgetSchema,
  optionWidgetSchema,
  arrayWidgetSchema,
]);
export const CompTypeSchema = z.object({
  componentName: z.string(),
  componentModule: z.string(),
  componentImg: z.string(),
  data: z.any(),
  props: z.array(propWigetSchema),
});
export const listOfCompArraySchema = z.array(CompTypeSchema);
export const mutliPageTypeSchema = z.object({
  pageName: z.string(),
  pageTitle: z.string(),
  pageDescription: z.string(),
  pageLayout: z.string(),
  pageImage: z.string().nullable(),
  compData: listOfCompArraySchema,
});
export const listOfmutliPageTypeSchema = z.array(mutliPageTypeSchema);
export type MutliPageType = z.infer<typeof mutliPageTypeSchema>;

async function getAllImageImportInAsset() {
  const images = import.meta.glob<{ default: ImageMetadata }>(
    "/src/assets/*.{jpeg,jpg,png,gif,svg,webp,avif,tiff}",
    {
      eager: true,
    },
  );
  return images;
}

export async function getLocalAssetsImg(inputWithSrcNAlt: {
  src: string;
  alt?: string;
}): Promise<any> {
  let input = inputWithSrcNAlt.src;

  const urlSchema = z.string().url();
  const result = urlSchema.safeParse(input);
  if (result.success) {
    return input;
  }
  const imageImports = await getAllImageImportInAsset();

  const imagePath = `/src/assets/${input}`;
  const specificImage = imageImports[imagePath];

  if (!specificImage) {
    throw new Error(`${input} Image ${imagePath} not found`);
  }
  const image = specificImage.default;
  return image;
}

export async function optimizeImagesInString(htmlString: string) {
  const root = parse(htmlString);

  const images = root.querySelectorAll("img");

  for (const img of images) {
    const src = img.getAttribute("title");
    if (src) {
      try {
        const deSource = String(`/src/assets/${src}`);
        const imageImports = await getAllImageImportInAsset();
        const optimizedImage = await getImage({
          src: imageImports[deSource].default,
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
