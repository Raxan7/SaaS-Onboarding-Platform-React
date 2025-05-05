import { Box, TextField, Typography, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material'
import { useFormikContext } from 'formik'

export const PaymentStep = () => {
  const { values, setFieldValue, touched, errors } = useFormikContext<{
    paymentMethod: string
    cardNumber: string
    expiryDate: string
    cvc: string
  }>()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Information
      </Typography>
      <Typography variant="body1" gutterBottom>
        Your free trial includes 1 qualified meeting guarantee. No payment required now.
      </Typography>

      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <RadioGroup
          name="paymentMethod"
          value={values.paymentMethod}
          onChange={(e) => setFieldValue('paymentMethod', e.target.value)}
        >
          <FormControlLabel
            value="card"
            control={<Radio />}
            label="Credit Card"
          />
          <FormControlLabel
            value="paypal"
            control={<Radio />}
            label="PayPal"
          />
        </RadioGroup>
      </FormControl>

      {values.paymentMethod === 'card' && (
        <>
          <TextField
            fullWidth
            name="cardNumber"
            label="Card Number"
            value={values.cardNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 16)
              setFieldValue('cardNumber', value)
            }}
            error={touched.cardNumber && Boolean(errors.cardNumber)}
            helperText={touched.cardNumber && errors.cardNumber}
            margin="normal"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              name="expiryDate"
              label="Expiry Date (MM/YY)"
              value={values.expiryDate}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                let formatted = value
                if (value.length > 2) {
                  formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}`
                }
                setFieldValue('expiryDate', formatted)
              }}
              margin="normal"
            />
            <TextField
              fullWidth
              name="cvc"
              label="CVC"
              value={values.cvc}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                setFieldValue('cvc', value)
              }}
              margin="normal"
            />
          </Box>
        </>
      )}
    </Box>
  )
}