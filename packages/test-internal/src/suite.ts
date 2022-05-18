interface TestImplementation {
  run: () => Promise<boolean>;
}

export const suite = async (...implementations: TestImplementation[]): Promise<boolean> => {
  for (let i = 0; i < implementations.length; i++) {
    const impl = implementations[i];
    try {
      const result = await impl.run();
      if (!result) {
        process.exit(1);
      }
    } catch (err) {
      process.exit(1);
    }
  }
  return true;
};
