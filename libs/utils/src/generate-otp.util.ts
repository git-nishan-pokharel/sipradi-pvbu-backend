/**
 * Generates a random OTP of specified length.
 * @param length - The length of the OTP to generate (default is 6).
 * @returns A string representing the generated OTP.
 */
export async function generateOtp(length = 6): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substring(0, length);
}
