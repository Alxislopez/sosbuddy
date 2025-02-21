import android.graphics.Color
import android.view.View
import android.widget.*
import androidx.core.content.ContextCompat
import android.text.InputType
import android.os.Handler
import android.os.Looper
import android.view.View.GONE
import android.view.View.VISIBLE
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.telephony.SmsManager
import androidx.core.app.ActivityCompat

class MainActivity : AppCompatActivity() {
    private var phoneNumberCount = 1
    private var isEditMode = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize views
        val returnToLoginButton = findViewById<Button>(R.id.returnToLoginButton)
        val changeNumbersButton = findViewById<Button>(R.id.changeNumbersButton)
        val emergencyButton = findViewById<Button>(R.id.emergencyButton)
        val savedNumbersText = findViewById<TextView>(R.id.savedNumbersText)
        val welcomeText = findViewById<TextView>(R.id.welcomeText)

        // Set welcome message
        val sharedPreferences = getSharedPreferences("EmergencyContacts", MODE_PRIVATE)
        val userName = sharedPreferences.getString("user_name", "User") ?: "User"
        welcomeText.text = "Welcome, $userName"

        // Display saved numbers
        val numbers = getStoredNumbers()
        if (numbers.isNotEmpty()) {
            savedNumbersText.text = "${numbers[0]} (Primary)\n${numbers.getOrNull(1) ?: ""}"
        }

        // Change numbers button click handler
        changeNumbersButton.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            intent.putExtra("EDIT_MODE", true)  // Add this flag to indicate edit mode
            startActivity(intent)
            finish()
        }

        // Return button click handler
        returnToLoginButton.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }

        // Emergency button click handler
        emergencyButton.setOnClickListener {
            val numbers = getStoredNumbers()
            if (numbers.isNotEmpty()) {
                numbers.forEach { number ->
                    sendSMS(number)
                }
                makeDirectCall(numbers[0])
            } else {
                Toast.makeText(this, "No emergency numbers saved", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun addPhoneNumberField() {
        phoneNumberCount++
        val container = findViewById<LinearLayout>(R.id.phoneNumberContainer)
        
        val horizontalLayout = LinearLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = resources.getDimensionPixelSize(R.dimen.margin_16)
            }
            orientation = LinearLayout.HORIZONTAL
        }

        val editText = EditText(this).apply {
            id = View.generateViewId()
            layoutParams = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1f
            )
            background = ContextCompat.getDrawable(context, R.drawable.input_background)
            hint = "Enter Emergency Number ${phoneNumberCount}"
            setHintTextColor(Color.parseColor("#CCCCCC"))
            setTextColor(Color.WHITE)
            inputType = InputType.TYPE_CLASS_PHONE
            setPadding(
                resources.getDimensionPixelSize(R.dimen.padding_16),
                resources.getDimensionPixelSize(R.dimen.padding_16),
                resources.getDimensionPixelSize(R.dimen.padding_16),
                resources.getDimensionPixelSize(R.dimen.padding_16)
            )
        }

        val deleteButton = ImageButton(this).apply {
            id = View.generateViewId()
            layoutParams = LinearLayout.LayoutParams(
                resources.getDimensionPixelSize(R.dimen.button_size),
                resources.getDimensionPixelSize(R.dimen.button_size)
            ).apply {
                marginStart = resources.getDimensionPixelSize(R.dimen.margin_8)
            }
            setImageResource(android.R.drawable.ic_menu_delete)
            setColorFilter(Color.WHITE)
            background = ContextCompat.getDrawable(context, R.drawable.input_background)
            setOnClickListener {
                container.removeView(horizontalLayout)
                phoneNumberCount--
                updateNumberHints()
            }
        }

        horizontalLayout.addView(editText)
        horizontalLayout.addView(deleteButton)
        container.addView(horizontalLayout)
    }

    private fun updateNumberHints() {
        val container = findViewById<LinearLayout>(R.id.phoneNumberContainer)
        var count = 1
        for (i in 0 until container.childCount) {
            val layout = container.getChildAt(i) as? LinearLayout ?: continue
            val editText = layout.getChildAt(0) as? EditText ?: continue
            editText.hint = if (count == 1) "Enter Primary Emergency Number" 
                          else "Enter Emergency Number $count"
            count++
        }
    }

    private fun getAllPhoneNumbers(): List<String> {
        val container = findViewById<LinearLayout>(R.id.phoneNumberContainer)
        return (0 until container.childCount)
            .map { container.getChildAt(it) as? LinearLayout }
            .filterNotNull()
            .map { it.getChildAt(0) as? EditText }
            .filterNotNull()
            .map { it.text.toString() }
            .filter { it.isNotEmpty() }
    }

    private fun getStoredNumbers(): List<String> {
        val sharedPreferences = getSharedPreferences("EmergencyContacts", MODE_PRIVATE)
        val primaryNumber = sharedPreferences.getString("primary_number", "") ?: ""
        val secondaryNumber = sharedPreferences.getString("secondary_number", "") ?: ""
        return listOf(primaryNumber, secondaryNumber).filter { it.isNotEmpty() }
    }

    private fun sendSMS(phoneNumber: String) {
        try {
            val smsManager = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                getSystemService(SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }
            smsManager.sendTextMessage(
                phoneNumber,
                null,
                "Emergency! I need immediate assistance!",
                null,
                null
            )
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to send SMS to $phoneNumber", Toast.LENGTH_SHORT).show()
        }
    }

    private fun makeDirectCall(phoneNumber: String) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
            try {
                val uri = Uri.parse("tel:$phoneNumber")
                val intent = Intent(Intent.ACTION_CALL, uri)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "Failed to make call", Toast.LENGTH_SHORT).show()
            }
        } else {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.CALL_PHONE),
                1
            )
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 1 && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            val numbers = getStoredNumbers()
            if (numbers.isNotEmpty()) {
                makeDirectCall(numbers[0])
            }
        }
    }
} 