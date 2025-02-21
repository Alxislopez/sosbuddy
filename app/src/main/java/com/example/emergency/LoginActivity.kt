import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val primaryNumberInput = findViewById<EditText>(R.id.primaryNumberInput)
        val secondaryNumberInput = findViewById<EditText>(R.id.secondaryNumberInput)
        val saveButton = findViewById<Button>(R.id.saveButton)
        
        // If coming from edit mode, load existing numbers
        if (intent.getBooleanExtra("EDIT_MODE", false)) {
            val sharedPreferences = getSharedPreferences("EmergencyContacts", MODE_PRIVATE)
            primaryNumberInput.setText(sharedPreferences.getString("primary_number", ""))
            secondaryNumberInput.setText(sharedPreferences.getString("secondary_number", ""))
        }

        saveButton.setOnClickListener {
            val primaryNumber = primaryNumberInput.text.toString()
            val secondaryNumber = secondaryNumberInput.text.toString()

            if (primaryNumber.isEmpty()) {
                Toast.makeText(this, "Please enter at least primary number", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Save numbers to SharedPreferences
            val sharedPreferences = getSharedPreferences("EmergencyContacts", MODE_PRIVATE)
            sharedPreferences.edit().apply {
                putString("primary_number", primaryNumber)
                putString("secondary_number", secondaryNumber)
                apply()
            }

            // Navigate to MainActivity
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            finish()
        }
    }
} 