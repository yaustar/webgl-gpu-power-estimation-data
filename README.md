# webgl-gpu-power-estimation-data

Repository of data scraped from various GPU benchmark websites and associated scripts that can be used with the [webgl-gpu-power-estimation](https://github.com/gkjohnson/webgl-gpu-power-estimation/) module. GPU benchmark and spec information scraped from:

- [videocardbenchmark.net](https://www.videocardbenchmark.net/GPU_mega_page.html)

## License Information

The scraped graphics card data provided in this repo is subject to the terms of the respective websites. Data and scripts are available to use as long as the data source and ownership are acknowledged. Repo contents should not be distributed in separate packages.

## How to generate Database

```
npm i
npm run build
```

## Database Information

The `database.json` object stores a database with scraped GPU names as keys and objects with database information as values which can be used by the [webgl-gpu-power-estimation](https://github.com/gkjohnson/webgl-gpu-power-estimation/) utility. [Geekbench](https://browser.geekbench.com/opencl-benchmarks) was used to find the closest PC GFX card to the Mac chips and used the same G3D performance value.

```js
{
  // Name of the GPU
  name,

  // G3D performance
  performance,
}
```
