# Setting Up Remote MongoDB Access for AROGYA MITRA

This guide will help you set up remote access to your MongoDB database, allowing team members to connect using MongoDB Compass from different devices.

## Step 1: Configure MongoDB to Accept Remote Connections

1. Open a Command Prompt as Administrator:
   - Right-click on the Start menu
   - Select "Command Prompt (Admin)" or "Windows PowerShell (Admin)"

2. Stop the MongoDB service:
   ```
   net stop MongoDB
   ```

3. Edit the MongoDB configuration file:
   - Navigate to your MongoDB installation directory (typically `C:\Program Files\MongoDB\Server\[version]\bin\mongod.cfg`)
   - Open the file with a text editor (as administrator)
   - Find or add the `net` section and modify it to use:
   ```yaml
   net:
     bindIp: 0.0.0.0  # This allows connections from any IP address
     port: 27017
   ```

4. Save the file and restart the MongoDB service:
   ```
   net start MongoDB
   ```

## Step 2: Configure Windows Firewall

1. Open Windows Defender Firewall with Advanced Security:
   - Press Win+R, type `wf.msc` and press Enter

2. Create a new Inbound Rule:
   - Click on "Inbound Rules" in the left panel
   - Click "New Rule..." in the right panel
   - Select "Port" and click Next
   - Select "TCP" and enter "27017" in the specific local ports field
   - Click Next and select "Allow the connection"
   - Click Next, keep all profiles selected
   - Give it a name (e.g., "MongoDB Remote Access") and click Finish

## Step 3: Connect Using MongoDB Compass

1. On the remote device, open MongoDB Compass

2. Enter the connection string using your server's IP address:
   ```
   mongodb://192.168.0.100:27017/?directConnection=true
   ```
   (Replace 192.168.0.100 with your server's actual IP address if it changes)

3. Click "Connect"

## Troubleshooting

If you're unable to connect:

1. Verify MongoDB is running on the server
2. Check that both computers are on the same network
3. Try temporarily disabling the Windows firewall for testing
4. Verify there are no other network restrictions (like router or antivirus settings)
5. Check if your server has a static IP; if not, the IP might change occasionally

## Security Considerations

The current setup allows unrestricted access to your MongoDB database. For production environments, you should:

1. Enable authentication in MongoDB
2. Create specific database users with appropriate permissions
3. Use a more restrictive IP binding or VPN for connections
4. Consider encrypting the database connection
