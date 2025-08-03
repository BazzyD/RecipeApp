// Allows importing JSON files in TypeScript modules
declare module "*.json" {
  const value: any;
  export default value;
}
