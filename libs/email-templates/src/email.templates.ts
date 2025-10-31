export class EmailTemplates {
  static readonly accountCreated = `
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0; font-size: 28px;">Account Created Successfully!</h1>
            <div style="width: 50px; height: 3px; background-color: #28a745; margin: 15px auto;"></div>
          </div>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #155724; margin: 0; font-weight: bold; text-align: center;">
              🎉 Welcome to {{company}}!
            </p>
          </div>

          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Hi {{name}},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Your account has been successfully created! To ensure the security of your account, you need to set up your password before you can log in.
          </p>

          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Click the button below to set up your password and activate your account:
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="{{setupPasswordUrl}}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,123,255,0.3);">
              Set Up Password
            </a>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 10px 0;">
              <strong>Account Details:</strong><br>
              Email: {{email}}<br>
              Account Type: {{accountType}}<br>
              Created: {{createdDate}}
            </p>
          </div>

          <div style="background-color: #f8f9fa; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #6c757d; font-size: 13px; margin: 0; line-height: 1.4;">
              <strong>Having trouble?</strong> If the button above doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all; color: #007bff;">{{setupPasswordUrl}}</span>
            </p>
          </div>

          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            If you didn't request this account, please ignore this email or contact our support team.<br><br>
            Best regards,<br>
            <strong>The {{company}} Team</strong><br>
            <span style="color: #ccc;">{{supportEmail}}</span>
          </p>
        </div>
      </body>
    </html>
  `;

  //reset otp email template
  static readonly resetOtpEmail = `
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0; font-size: 28px;">Reset Your Password</h1>
            <div style="width: 50px; height: 3px; background-color: #28a745; margin: 15px auto;"></div>
          </div> 
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #155724; margin: 0; font-weight: bold; text-align: center;">
              🔒 Password Reset Requested
            </p>
          </div>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Hi {{name}},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            We received a request to reset your password for your account. If you did not make this request, please ignore this email.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Your OTP for resetting your password is:
          </p>
          <div style="text-align: center; margin: 35px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #007bff;">{{otp}}</span>
          </div>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Please enter this OTP on the password reset page to proceed with resetting your password.
          </p>
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 10px 0;">
              <strong>Account Details:</strong><br>
              Email: {{email}}<br>
              Role: {{role}}<br>
              Requested At: {{requestedAt}}
            </p>
          </div>
          <div style="background-color: #f8f9fa; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #6c757d; font-size: 13px; margin: 0; line-height: 1.4;">
              <strong>Having trouble?</strong> If you didn't request this password reset, please ignore this email or contact our support team.<br>
            </p>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br>
            <strong>The Support Team</strong><br>
            <span style="color: #ccc;">{{supportEmail}}</span>
          </p>
        </div>
      </body>
    </html>
  `;
}
