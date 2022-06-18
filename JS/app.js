const strRegex = /^[a-zA-Z\s]*$/ // containing only letters
const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
/* supports following number formats - (123) 456-7890, (123)456-7890, 123-456-7890, 123.456.7890, 1234567890, +31636363634, 075-63546725 */
const digitRegex = /^\d+$/

const countryList = document.getElementById('country-list')
const fullscreenDiv = document.getElementById('fullscreen-div')
const modal = document.getElementById('modal')
const addBtn = document.getElementById('add-btn')
const closeBtn = document.getElementById('close-btn')
const modalBtns = document.getElementById('modal-btns')
const form = document.getElementById('modal')
const addrBookList = document.querySelector('#addr-book-list tbody')

let addrName =
  (firstName =
  lastName =
  email =
  phone =
  streetAddr =
  postCode =
  city =
  country =
  labels =
    '')

class Address {
  constructor(
    id,
    addrName,
    firstName,
    lastName,
    email,
    phone,
    streetAddr,
    postCode,
    city,
    country,
    labels
  ) {
    this.id = id
    this.addrName = addrName
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.phone = phone
    this.streetAddr = streetAddr
    this.postCode = postCode
    this.city = city
    this.country = country
    this.labels = labels
  }

  static getAdrdresses() {
    let addresses
    if (localStorage.getItem('addresses') == null) {
      addresses = []
    } else {
      addresses = JSON.parse(localStorage.getItem('addresses'))
    }
    return addresses
  }

  static addAddress(address) {
    const addresses = Address.getAdrdresses()
    addresses.push(address)
    localStorage.setItem('addresses', JSON.stringify(addresses))
  }

  static deleteAddress(id) {
    const addresses = Address.getAdrdresses()
    addresses.forEach((address, index) => {
      if (address.id == id) {
        addresses.splice(index, 1)
      }
    })

    localStorage.setItem('addresses', JSON.stringify(addresses))
    form.reset()
    UI.closeModal()
    addrBookList.innerHTML = ''
    UI.showAddresslist()
  }

  static updateAddress(item) {}
}

class UI {
  static showAddresslist() {
    const addresses = Address.getAdrdresses()
    addresses.forEach((address) => {
      UI.addToaddressList(address)
    })
  }

  static addToaddressList(address) {
    const tableRow = document.createElement('tr')
    tableRow.setAttribute('data-id', address.id)
    tableRow.innerHTML = `
    <td>${address.id}</td>
    <td>
        <span class = "addressing-name">${
          address.addrName
        }</span><br><span class = "address">${address.streetAddr} ${
      address.postCode
    } ${address.city} ${address.country}</span>
    </td>
    <td><span>${address.labels}</span></td>
    <td>${address.firstName + ' ' + address.lastName}</td>
    <td>${address.phone}</td>
    `
    addrBookList.appendChild(tableRow)
  }

  static showModal() {
    modal.style.display = 'block'
    fullscreenDiv.style.display = 'block'
  }

  static closeModal() {
    modal.style.display = 'none'
    fullscreenDiv.style.display = 'none'
  }

  static showModalData(id) {
    const address = Address.getAdrdresses()
    address.forEach((address) => {
      if (address.id == id) {
        form.addr_ing_name.value = address.addrName
        form.first_name.value = address.firstName
        form.last_name.value = address.lastName
        form.email.value = address.email
        form.phone.value = address.phone
        form.street_addr.value = address.streetAddr
        form.postal_code.value = address.postCode
        form.city.value = address.city
        form.country.value = address.country
        form.labels.value = address.labels
        document.getElementById('modal-title').innerHTML = 'Change address'
        document.getElementById('modal-btns').innerHTML = `
        <button type = "submit" id = "update-btn" data-id = "${id}">Update </button>
        <button type = "button" id = "delete-btn" data-id = "${id}">Delete </button>
        `
      }
    })
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadJSON()
  eventListener()
  UI.showAddresslist()
})

function eventListener() {
  addBtn.addEventListener('click', () => {
    form.reset()
    document.getElementById('modal-title').innerHTML = 'Add address'
    UI.showModal()
    document.getElementById('modal-btns').innerHTML = `
            <button type = "submit" id = "save-btn"> Save </button>
        `
  })
  closeBtn.addEventListener('click', UI.closeModal)
  modalBtns.addEventListener('click', (event) => {
    event.preventDefault()
    if (event.target.id == 'save-btn') {
      let idFromvalid = getFromData()
      if (!idFromvalid) {
        form.querySelectorAll('input').forEach((input) => {
          setTimeout(() => {
            input.classList.remove('errorMsg')
          }, 2000)
        })
      } else {
        let allItem = Address.getAdrdresses()
        let lastItemId = allItem.length > 0 ? allItem[allItem.length - 1].id : 0
        lastItemId++
        const addressItem = new Address(
          lastItemId,
          addrName,
          firstName,
          lastName,
          email,
          phone,
          streetAddr,
          postCode,
          city,
          country,
          labels
        )
        Address.addAddress(addressItem)
        UI.closeModal()
        UI.addToaddressList(addressItem)
        form.reset()
      }
    }
  })
  addrBookList.addEventListener('click', (event) => {
    UI.showModal()
    if (event.target.parentElement.tagName == 'TD') {
      trElement = event.target.parentElement.parentElement
    }

    if (event.target.parentElement.tagName == 'TR') {
      trElement = event.target.parentElement
    }

    let viewID = trElement.dataset.id
    UI.showModalData(viewID)
  })
  ///  delete
  modalBtns.addEventListener('click', function (event) {
    if (event.target.id == 'delete-btn') {
      Address.deleteAddress(event.target.dataset.id)
    }
  })
  modalBtns.addEventListener('click', function (event) {
    event.preventDefault()
    if (event.target.id == 'update-btn') {
      let id = event.target.dataset.id
      let isFormvalid = getFromData()
      if (!isFormvalid) {
        form.querySelectorAll('input').forEach((input) => {
          setTimeout(() => {
            input.classList.remove('errorMsg')
          }, 1500)
        })
      } else {
        const addressItem = new Address(
          id,
          addrName,
          firstName,
          lastName,
          email,
          phone,
          streetAddr,
          postCode,
          city,
          country,
          labels
        )
        Address.updateAddress(addressItem)
        UI.closeModal()
        form.reset()
      }
    }
  })
}

function loadJSON() {
  fetch('countries.json')
    .then((result) => {
      return result.json()
    })
    .then((data) => {
      let hmtl = ''
      console.log(data)
      data.forEach((country) => {
        hmtl += `
          <option>${country.country}</option>
         `
      })

      countryList.innerHTML = hmtl
    })
    .catch((err) => {})
}

/// form valid

function getFromData() {
  let inputValidStatus = []
  if (
    !strRegex.test(form.addr_ing_name.value) ||
    form.addr_ing_name.value.trim().length == 0
  ) {
    addErrMsg(form.addr_ing_name)
    inputValidStatus[0] = false
  } else {
    addrName = form.addr_ing_name.value
    inputValidStatus[0] = true
  }

  if (
    !strRegex.test(form.first_name.value) ||
    form.first_name.value.trim().length == 0
  ) {
    addErrMsg(form.first_name)
    inputValidStatus[1] = false
  } else {
    firstName = form.first_name.value
    inputValidStatus[1] = true
  }

  if (
    !strRegex.test(form.last_name.value) ||
    form.last_name.value.trim().length == 0
  ) {
    addErrMsg(form.last_name)
    inputValidStatus[2] = false
  } else {
    lastName = form.last_name.value
    inputValidStatus[2] = true
  }

  if (!emailRegex.test(form.email.value)) {
    addErrMsg(form.email)
    inputValidStatus[3] = false
  } else {
    email = form.email.value
    inputValidStatus[3] = true
  }

  if (!phoneRegex.test(form.phone.value)) {
    addErrMsg(form.phone)
    inputValidStatus[4] = false
  } else {
    phone = form.phone.value
    inputValidStatus[4] = true
  }

  if (!(form.street_addr.value.trim().length > 0)) {
    addErrMsg(form.street_addr)
    inputValidStatus[5] = false
  } else {
    streetAddr = form.street_addr.value
    inputValidStatus[5] = true
  }

  if (!digitRegex.test(form.postal_code.value)) {
    addErrMsg(form.postal_code)
    inputValidStatus[6] = false
  } else {
    postCode = form.postal_code.value
    inputValidStatus[6] = true
  }

  if (!strRegex.test(form.city.value) || form.city.value.trim().length == 0) {
    addErrMsg(form.city)
    inputValidStatus[7] = false
  } else {
    city = form.city.value
    inputValidStatus[7] = true
  }
  country = form.country.value
  labels = form.labels.value
  return inputValidStatus.includes(false) ? false : true
}

function addErrMsg(inputBox) {
  inputBox.classList.add('errorMsg')
}
