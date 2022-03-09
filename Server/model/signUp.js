const mongoose = require('mongoose')

const schema = mongoose.Schema({

//------------CUSTOMER---------------
    name: {
        type: String
    },

    email: {
        type: String
    },
    phone: {
        type: String
    },
    password: {
        type: String
    },
    confirmPassword: {
        type: String
    },
    deliverOption: {
        type: String,
        enum: ['delivery', 'pickup'],
        default: 'delivery'
    },
    location: {
        type: {
            type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number]
        }
    },
    profile_picture: {
        type: String
    },
    lat: {
        type: Number
    },
    lng: {
        type: Number
    },
    googleId: {
        type: Number
    },
    facebookId: {
        type: Number
    },
    login_type: {
        type: Number,
        // 0(Mannual), 1(Google), 2(Facebook)
        enum: [0, 1, 2],
        default: 0
    },
    user_type: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    // ---------SELLER-------------

  seller: {

    pan_number: {
        type: Number
    },
    adhar_number: {
        type: Number
    },
    address: {

        street_name: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        pin: {
            type: String
        }
    },
  account_details: {

        account_number: {
            type: Number
        },
        bank_name: {
            type: String
        },
        branch_code: {
            type: String
        },
        tc: {
            type: Number,
            enum: [0, 1],
            default: 0
        }
    },
  home_status: {
      type: Number,
      enum: [0, 1],
      default: 0
  },
  subscription: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0
  },
  account_activation: {
      type: Number,
      enum: [0, 1],
      default: 0
  }
}
})

schema.index({ location: '2dsphere' }, { sparse: true })
const customer = mongoose.model('customer', schema)

module.exports = customer
